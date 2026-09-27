import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
});
for (const key of [
  'window',
  'document',
  'HTMLElement',
  'HTMLInputElement',
  'Event',
  'KeyboardEvent',
  'MouseEvent',
  'CompositionEvent',
])
  globalThis[key] = dom.window[key];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement: h, act } = await import('react');
const { createRoot } = await import('react-dom/client');
const { renderToString } = await import('react-dom/server');
const { FileField, Field } = await import('../dist/index.js');
let root, host;
afterEach(async () => {
  if (root) await act(() => root.unmount());
  root = undefined;
  host?.remove();
});
async function render(node) {
  if (!root) {
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
  }
  await act(async () => root.render(node));
}
async function type(node, value) {
  await act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(node, value);
    node.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
const trigger = () => host.querySelector('button');
const picker = () => host.querySelector('[type=file]');
async function click(node) {
  await act(async () => node.click());
}
async function key(node, key, options = {}) {
  await act(async () =>
    node.dispatchEvent(
      new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...options }),
    ),
  );
}
const file = (name = 'resume.pdf', body = 'hello', type = 'application/pdf') =>
  new window.File([body], name, { type, lastModified: 1 });
async function upload(files) {
  await act(() => {
    Object.defineProperty(picker(), 'files', { value: files, configurable: true });
    picker().dispatchEvent(new Event('change', { bubbles: true }));
  });
}
async function drop(files, eventType = 'drop') {
  await act(() => {
    const event = new Event(eventType, { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'dataTransfer', {
      value: { files, types: ['Files'], dropEffect: 'none' },
    });
    host.querySelector('[data-file-field]').dispatchEvent(event);
  });
}
function formData() {
  const form = host.querySelector('form');
  const data = new window.FormData(form);
  const event = new Event('formdata');
  Object.defineProperty(event, 'formData', { value: data });
  form.dispatchEvent(event);
  return data;
}
test('SSR labels, picker native attributes, button semantics and diagnostics', () => {
  const doc = new JSDOM(
    renderToString(
      h(
        Field,
        { required: true },
        h(Field.Label, null, 'Resume'),
        h(FileField, { accept: '.pdf,image/*', capture: 'environment', multiple: true }),
      ),
    ),
  ).window.document;
  assert.equal(doc.querySelector('label').htmlFor, doc.querySelector('button').id);
  assert.equal(doc.querySelector('button').getAttribute('aria-required'), 'true');
  assert.equal(doc.querySelector('[type=file]').getAttribute('capture'), 'environment');
  assert.equal(doc.querySelector('[type=file]').multiple, true);
  assert.equal(doc.querySelector('button button'), null);
  assert.throws(() => renderToString(h(FileField, { value: [] })), /single requires/);
  assert.throws(() => renderToString(h(FileField, { accept: 'pdf' })), /accept/);
});
test('single picker replacement, rejected selection keeps model, repeat selection and clear', async () => {
  let changes = [],
    rejected = [];
  await render(
    h(FileField, {
      accept: '.pdf',
      maxSize: 10,
      onChange: (v) => changes.push(v),
      onReject: (r) => (rejected = r),
    }),
  );
  const first = file();
  await upload([first]);
  assert.equal(changes.at(-1), first);
  assert.match(trigger().textContent, /resume.pdf/);
  assert.equal(picker().value, '');
  await upload([file('bad.txt', 'text', 'text/plain')]);
  assert.equal(changes.length, 1);
  assert.equal(rejected[0].reason, 'type');
  assert.equal(trigger().getAttribute('aria-invalid'), 'true');
  await upload([file('big.pdf', '12345678901')]);
  assert.equal(rejected[0].reason, 'size');
  const next = file('new.pdf');
  await upload([next]);
  assert.equal(changes.at(-1), next);
  assert.equal(host.querySelector('[role=alert]'), null);
  await upload([]);
  assert.equal(changes.at(-1), next);
  await click(host.querySelector('[aria-label="파일 모두 지우기"]'));
  assert.equal(changes.at(-1), null);
  assert.equal(document.activeElement, trigger());
  await upload([next]);
  assert.equal(changes.at(-1), next);
});
test('multiple drops append, deduplicate, enforce limits, remove and submit exact File objects', async () => {
  let changes, rejected;
  await render(
    h(
      'form',
      null,
      h('input', { name: 'files', defaultValue: 'unrelated' }),
      h(FileField, {
        multiple: true,
        name: 'files',
        accept: '.pdf',
        maxCount: 2,
        onChange: (v) => (changes = v),
        onReject: (r) => (rejected = r),
      }),
    ),
  );
  const a = file('a.pdf'),
    b = file('b.pdf'),
    c = file('c.pdf');
  await upload([a]);
  await drop([a, b, c]);
  assert.deepEqual(changes, [a, b]);
  assert.equal(rejected[0].reason, 'count');
  const data = formData();
  assert.equal(data.getAll('files')[0], 'unrelated');
  assert.deepEqual(
    data
      .getAll('files')
      .slice(1)
      .map((f) => f.name),
    ['a.pdf', 'b.pdf'],
  );
  await click(host.querySelector('[aria-label="a.pdf 삭제"]'));
  assert.deepEqual(changes, [b]);
  assert.deepEqual(
    formData()
      .getAll('files')
      .slice(1)
      .map((f) => f.name),
    ['b.pdf'],
  );
  await drop([c]);
  assert.deepEqual(changes, [b, c]);
});
test('native reset, prevented reset, controlled external updates, readonly submission and disabled omission', async () => {
  const initial = file('initial.pdf');
  let calls = 0;
  const view = (p) =>
    h(
      'form',
      null,
      h(FileField, { name: 'resume', defaultValue: initial, onChange: () => calls++, ...p }),
    );
  await render(view({}));
  await upload([file('other.pdf')]);
  host.querySelector('form').addEventListener('reset', (e) => e.preventDefault(), { once: true });
  await act(async () => host.querySelector('form').reset());
  assert.equal(formData().get('resume').name, 'other.pdf');
  await act(async () => host.querySelector('form').reset());
  assert.equal(formData().get('resume').name, 'initial.pdf');
  await render(view({ value: initial, readOnly: true }));
  const before = calls;
  await drop([file('blocked.pdf')]);
  assert.equal(calls, before);
  assert.equal(formData().get('resume').name, 'initial.pdf');
  await render(view({ value: null }));
  assert.equal(formData().get('resume'), null);
  await render(view({ value: initial, disabled: true }));
  assert.equal(trigger().disabled, true);
  assert.equal(formData().get('resume'), null);
});
test('custom composition, event cancellation and file drag state', async () => {
  let calls = 0;
  await render(
    h(
      FileField,
      { multiple: true, onChange: () => calls++, onDrop: (e) => e.preventDefault() },
      h(FileField.Trigger, { asChild: true }, h('button', null, 'Choose')),
      h(FileField.List),
      h(FileField.Clear),
    ),
  );
  await drop([file()]);
  assert.equal(calls, 0);
  await drop([file()], 'dragenter');
  assert.equal(host.querySelector('[data-file-field]').getAttribute('data-dragover'), '');
  await drop([], 'dragleave');
  assert.equal(host.querySelector('[data-file-field]').getAttribute('data-dragover'), null);
  let pickerClicks = 0;
  picker().addEventListener('click', () => pickerClicks++);
  await click(trigger());
  assert.equal(pickerClicks, 1);
});
test('RHF File model, required focus, submission, reset and disabled omission', async () => {
  const { Field: F } = await import('../dist/react-hook-form.js');
  const { FormProvider, useForm } = await import('react-hook-form');
  let methods, result;
  function App({ disabled = false }) {
    methods = useForm({ defaultValues: { resume: null } });
    return h(
      FormProvider,
      methods,
      h(
        'form',
        { onSubmit: methods.handleSubmit((v) => (result = v)) },
        h(
          F,
          {
            name: 'resume',
            controlMode: 'value',
            disabled,
            registerOptions: { required: 'Required' },
          },
          h(F.Label, null, 'Resume'),
          h(FileField, { accept: '.pdf' }),
          h(F.Error),
        ),
      ),
    );
  }
  await render(h(App));
  const submit = () =>
    act(async () =>
      host
        .querySelector('form')
        .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })),
    );
  await submit();
  assert.equal(document.activeElement, trigger());
  const resume = file();
  await upload([resume]);
  await submit();
  assert.equal(result.resume, resume);
  await act(async () => methods.reset());
  assert.equal(host.querySelector('[aria-label="파일 모두 지우기"]'), null);
  await render(h(App, { disabled: true }));
  await submit();
  assert.equal(result.resume, undefined);
});
