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
])
  globalThis[key] = dom.window[key];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement: h, act } = await import('react');
const { createRoot } = await import('react-dom/client');
const { renderToString } = await import('react-dom/server');
const { FileField, Field } = await import('../dist/index.js');

const nativeUrl = { create: URL.createObjectURL, revoke: URL.revokeObjectURL };
let root, host;
afterEach(async () => {
  if (root) await act(() => root.unmount());
  root = undefined;
  host?.remove();
  URL.createObjectURL = nativeUrl.create;
  URL.revokeObjectURL = nativeUrl.revoke;
});
async function render(node) {
  if (!root) {
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
  }
  await act(async () => root.render(node));
}
const trigger = () => host.querySelector('[data-file-field] button[id]');
const picker = () => host.querySelector('[type=file]');
const fieldRoot = () => host.querySelector('[data-file-field]');
async function click(node) {
  await act(async () => node.click());
}
const file = (name = 'resume.pdf', body = 'hello', type = 'application/pdf') =>
  new window.File([body], name, { type, lastModified: 1 });
async function upload(files) {
  await act(() => {
    Object.defineProperty(picker(), 'files', { value: files, configurable: true });
    picker().dispatchEvent(new Event('change', { bubbles: true }));
  });
}
async function drag(type, files = [], target = fieldRoot(), types = ['Files']) {
  let event;
  await act(() => {
    event = new Event(type, { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'dataTransfer', {
      value: { files, types, dropEffect: 'none' },
    });
    target.dispatchEvent(event);
  });
  return event;
}
async function paste(files, target = trigger()) {
  let event;
  await act(() => {
    event = new Event('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'clipboardData', { value: { files, getData: () => '' } });
    target.dispatchEvent(event);
  });
  return event;
}
function formData() {
  const form = host.querySelector('form');
  const data = new window.FormData(form);
  const event = new Event('formdata');
  Object.defineProperty(event, 'formData', { value: data });
  form.dispatchEvent(event);
  return data;
}
function tracked(props = {}) {
  const changes = [];
  const rejected = [];
  return {
    changes,
    rejected,
    node: h(FileField, {
      'aria-label': 'Files',
      ...props,
      onValueChange: (value) => changes.push(value),
      onReject: (value) => rejected.push(value),
    }),
  };
}
function stubObjectUrls() {
  const created = [];
  const revoked = [];
  URL.createObjectURL = (blob) => {
    const url = `blob:${blob.name}:${created.length}`;
    created.push(url);
    return url;
  };
  URL.revokeObjectURL = (url) => revoked.push(url);
  return { created, revoked };
}

test('SSR: labels, native picker attributes, button semantics, validator and diagnostics', () => {
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
  const button = doc.querySelector('[data-file-field] button');
  assert.equal(doc.querySelector('label').htmlFor, button.id);
  assert.equal(button.getAttribute('aria-required'), 'true');
  assert.ok(button.hasAttribute('data-field-input'));
  assert.equal(doc.querySelector('[type=file]').getAttribute('capture'), 'environment');
  assert.equal(doc.querySelector('[type=file]').multiple, true);
  assert.equal(doc.querySelector('[type=file]').hasAttribute('name'), false);
  assert.equal(doc.querySelectorAll('[data-form-value-validator]').length, 1);
  assert.equal(doc.querySelector('button button'), null);
  assert.throws(() => renderToString(h(FileField, { value: [] })), /single requires/);
  assert.throws(() => renderToString(h(FileField, { accept: 'pdf' })), /accept/);
});

test('single: replacement, rejections keep the model, a repeat pick, and clear', async () => {
  const state = tracked({ accept: '.pdf', maxSize: 10 });
  await render(state.node);
  const first = file();
  await upload([first]);
  assert.equal(state.changes.at(-1), first);
  assert.match(trigger().textContent, /resume.pdf/);
  assert.equal(picker().value, '');
  await upload([file('bad.txt', 'text', 'text/plain')]);
  assert.equal(state.changes.length, 1);
  assert.equal(state.rejected.at(-1)[0].reason, 'type');
  assert.equal(trigger().getAttribute('aria-invalid'), 'true');
  assert.equal(
    host.querySelector('[role=alert]').textContent,
    'bad.txt: 허용되지 않는 파일 형식입니다.',
  );
  await upload([file('big.pdf', '12345678901')]);
  assert.equal(host.querySelector('[role=alert]').textContent, 'big.pdf: 10 B보다 큽니다.');
  const next = file('new.pdf');
  await upload([next]);
  assert.equal(state.changes.at(-1), next);
  assert.equal(host.querySelector('[role=alert]'), null);
  await upload([]);
  assert.equal(state.changes.at(-1), next, 'cancelling the picker keeps the file');
  assert.ok(
    host.querySelector('[data-file-field-control] [aria-label="파일 모두 지우기"]'),
    'Clear sits inside the field surface with the trigger',
  );
  await click(host.querySelector('[aria-label="파일 모두 지우기"]'));
  assert.equal(state.changes.at(-1), null);
  assert.equal(document.activeElement, trigger());
  await upload([next]);
  assert.equal(state.changes.at(-1), next, 'the same file can be picked again');
});

test('multiple: appends, dedupes, limits, and removal keeps focus in the list', async () => {
  const state = tracked({ multiple: true, accept: '.pdf', maxCount: 3 });
  await render(
    h('form', null, h('input', { name: 'files', defaultValue: 'unrelated' }), state.node),
  );
  const [a, b, c, d] = ['a.pdf', 'b.pdf', 'c.pdf', 'd.pdf'].map((name) => file(name));
  await upload([a]);
  await drag('drop', [a, b, c, d]);
  assert.deepEqual(state.changes.at(-1), [a, b, c]);
  assert.equal(state.rejected.at(-1)[0].reason, 'count');
  assert.equal(
    host.querySelector('[role=alert]').textContent,
    'd.pdf: 최대 3개까지 고를 수 있습니다.',
  );
  assert.match(trigger().textContent, /파일 3개/);
  await click(host.querySelector('[aria-label="a.pdf 삭제"]'));
  assert.deepEqual(state.changes.at(-1), [b, c]);
  assert.equal(document.activeElement, host.querySelector('[aria-label="b.pdf 삭제"]'));
  await click(host.querySelector('[aria-label="c.pdf 삭제"]'));
  assert.equal(document.activeElement, host.querySelector('[aria-label="b.pdf 삭제"]'));
  await click(host.querySelector('[aria-label="b.pdf 삭제"]'));
  assert.equal(document.activeElement, trigger(), 'the last removal returns to the trigger');
});

test('FormData carries the exact File objects and leaves other fields alone', async () => {
  const state = tracked({ multiple: true, name: 'files' });
  await render(
    h('form', null, h('input', { name: 'files', defaultValue: 'unrelated' }), state.node),
  );
  const a = file('a.pdf');
  const b = file('b.pdf');
  await upload([a, b]);
  const data = formData().getAll('files');
  assert.equal(data[0], 'unrelated');
  assert.deepEqual(data.slice(1), [a, b]);
});

test('paste takes files from the clipboard; text pastes are left alone', async () => {
  stubObjectUrls();
  const state = tracked({ multiple: true });
  await render(state.node);
  const shot = file('screenshot.png', 'png', 'image/png');
  const event = await paste([shot]);
  assert.equal(event.defaultPrevented, true);
  assert.deepEqual(state.changes.at(-1), [shot]);
  const text = await paste([]);
  assert.equal(text.defaultPrevented, false);
});

test('dragging over nested children stays one drag; text drags and prevented drops are ignored', async () => {
  const state = tracked({ multiple: true, onDrop: (event) => event.defaultPrevented });
  await render(state.node);
  await drag('dragenter');
  assert.ok(fieldRoot().hasAttribute('data-dragging'));
  await drag('dragenter', [], trigger());
  await drag('dragleave');
  assert.ok(fieldRoot().hasAttribute('data-dragging'), 'moving onto a child is not leaving');
  await drag('dragleave', [], trigger());
  assert.equal(fieldRoot().hasAttribute('data-dragging'), false);
  const over = await drag('dragover');
  assert.equal(over.defaultPrevented, true, 'files may be dropped');
  const textOver = await drag('dragover', [], fieldRoot(), ['text/plain']);
  assert.equal(textOver.defaultPrevented, false, 'text is not a drop target');
  await render(
    h(FileField, {
      key: 'prevented',
      'aria-label': 'Files',
      multiple: true,
      onValueChange: () => state.changes.push('changed'),
      onDrop: (event) => event.preventDefault(),
    }),
  );
  await drag('dragenter');
  await drag('drop', [file()]);
  assert.equal(state.changes.includes('changed'), false);
  assert.equal(fieldRoot().hasAttribute('data-dragging'), false);
});

test('image previews use object URLs that are revoked when the file goes', async () => {
  const urls = stubObjectUrls();
  const a = file('a.png', 'a', 'image/png');
  const b = file('b.png', 'b', 'image/png');
  const doc = file('c.pdf');
  await render(tracked({ multiple: true, defaultValue: [a, b, doc] }).node);
  const images = () => [...host.querySelectorAll('[data-file-field-preview] img')];
  assert.deepEqual(
    images().map((img) => img.getAttribute('src')),
    ['blob:a.png:0', 'blob:b.png:1'],
    'only images get a preview',
  );
  assert.ok(host.querySelectorAll('[data-file-field-preview] svg').length >= 1);
  await click(host.querySelector('[aria-label="a.png 삭제"]'));
  await act(async () => Promise.resolve());
  assert.deepEqual(urls.revoked, ['blob:a.png:0']);
  assert.deepEqual(
    images().map((img) => img.getAttribute('src')),
    ['blob:b.png:1'],
    'a stable key keeps the next preview instead of making a new one',
  );
  assert.equal(urls.created.length, 2);
  await act(() => root.unmount());
  root = undefined;
  await act(async () => Promise.resolve());
  assert.deepEqual(urls.revoked, ['blob:a.png:0', 'blob:b.png:1']);
});

test('dropzone: limits are described up front, and a single file is listed with its preview', async () => {
  stubObjectUrls();
  await render(
    tracked({
      appearance: 'dropzone',
      accept: 'image/*,.pdf,application/x-zip',
      maxSize: 5 * 1024 * 1024,
      defaultValue: file('cover.png', 'x', 'image/png'),
    }).node,
  );
  const hint = document.getElementById(
    trigger()
      .getAttribute('aria-describedby')
      .split(' ')
      .find((id) => id.endsWith('-limits')),
  );
  assert.equal(hint.textContent, '이미지, PDF, ZIP · 파일당 최대 5 MB');
  assert.equal(fieldRoot().dataset.appearance, 'dropzone');
  assert.equal(host.querySelectorAll('[role=list] > li [data-file-field-item]').length, 1);
  assert.equal(host.querySelector('[data-file-field-control]'), null);
});

test('rows are dense outline Items in a group; Clear and Remove are ghost IconButtons', async () => {
  stubObjectUrls();
  await render(
    tracked({
      multiple: true,
      defaultValue: [file('quarterly-report.pdf'), file('photo.png', 'png', 'image/png')],
    }).node,
  );
  const list = host.querySelector('[data-item-group]');
  assert.equal(list.tagName, 'UL');
  assert.equal(list.getAttribute('role'), 'list');
  assert.equal(list.getAttribute('aria-label'), '고른 파일');
  assert.deepEqual(
    [...list.children].map((child) => child.tagName),
    ['LI', 'LI'],
  );
  const [row, image] = host.querySelectorAll('[data-file-field-item]');
  assert.ok(row.hasAttribute('data-item'));
  assert.equal(row.dataset.variant, 'outline');
  assert.equal(row.dataset.size, 'standard');
  assert.ok(row.hasAttribute('data-dense'));
  assert.equal(row.hasAttribute('role'), false, 'a static row is not a button');
  const title = row.querySelector('[data-item-title]');
  assert.equal(title.textContent, 'quarterly-report.pdf');
  assert.equal(title.title, 'quarterly-report.pdf', 'the full name survives truncation');
  assert.match(title.className, /(^| )truncate( |$)/);
  assert.equal(row.querySelector('[data-item-description]').textContent, '5 B');
  const preview = image.querySelector('[data-file-field-preview]');
  assert.ok(preview.hasAttribute('data-item-media'), 'the preview is the row media');
  assert.equal(preview.dataset.variant, 'soft');
  assert.equal(preview.querySelector('img').getAttribute('src'), 'blob:photo.png:0');
  const remove = row.querySelector('[data-item-actions] [data-file-field-remove]');
  assert.equal(remove.tagName, 'BUTTON');
  assert.equal(remove.dataset.variant, 'ghost');
  assert.match(remove.className, /(^| )size-7( |$)/);
  const clear = host.querySelector('[data-file-field-control] [data-file-field-clear]');
  assert.equal(clear.dataset.variant, 'ghost');
  assert.match(clear.className, /(^| )size-7( |$)/);
  assert.match(clear.className, /(^| )me-1( |$)/, 'Clear keeps its inset in the bare control');
  assert.doesNotMatch(clear.className, /-me-2/);
  await render(
    tracked({ multiple: true, size: 'tiny', defaultValue: [file('a.pdf')], key: 'tiny' }).node,
  );
  const tiny = host.querySelector('[data-file-field-item]');
  assert.equal(tiny.dataset.size, 'tiny');
  assert.match(tiny.querySelector('[data-file-field-remove]').className, /(^| )size-6( |$)/);
});

test('Clear and Remove keep their handlers, and asChild lends their look to the given button', async () => {
  const state = tracked({ multiple: true, defaultValue: [file('a.pdf'), file('b.pdf')] });
  await render(
    h(
      FileField,
      { ...state.node.props, key: 'custom' },
      h(FileField.Trigger),
      h(
        FileField.Clear,
        { onClick: (event) => event.preventDefault() },
        h('svg', { 'data-glyph': '' }),
      ),
      h(FileField.List, null, (files) =>
        files.map((item) =>
          h(
            FileField.Item,
            { key: item.name, file: item },
            item.name,
            h(FileField.Remove, { file: item, asChild: true }, h('button', { className: 'own' })),
          ),
        ),
      ),
    ),
  );
  const clear = host.querySelector('[data-file-field-clear]');
  assert.ok(clear.querySelector('[data-glyph]'), 'a child of Clear is its glyph');
  await click(clear);
  assert.equal(state.changes.length, 0, 'a prevented click keeps the files');
  const remove = host.querySelector('[aria-label="a.pdf 삭제"]');
  assert.ok(remove.classList.contains('own'));
  assert.equal(remove.dataset.variant, 'ghost');
  await click(remove);
  assert.deepEqual(
    state.changes.at(-1).map((item) => item.name),
    ['b.pdf'],
  );
});

test('required is enforced natively; reset, prevented reset, read-only and disabled', async () => {
  const initial = file('initial.pdf');
  let calls = 0;
  const view = (props) =>
    h(
      'form',
      null,
      h(FileField, {
        'aria-label': 'Resume',
        name: 'resume',
        defaultValue: initial,
        onValueChange: () => calls++,
        ...props,
      }),
    );
  await render(view({ defaultValue: null, required: true }));
  const form = host.querySelector('form');
  assert.equal(form.checkValidity(), false);
  await act(() => host.querySelector('[data-form-value-validator]').focus());
  assert.equal(document.activeElement, trigger());
  await upload([file('other.pdf')]);
  assert.equal(form.checkValidity(), true);
  await render(h('div', { key: 'reset' }, view({})));
  await upload([file('other.pdf')]);
  host.querySelector('form').addEventListener('reset', (e) => e.preventDefault(), { once: true });
  await act(async () => {
    host.querySelector('form').reset();
    await Promise.resolve();
  });
  assert.equal(formData().get('resume').name, 'other.pdf');
  await act(async () => {
    host.querySelector('form').reset();
    await Promise.resolve();
  });
  assert.equal(formData().get('resume').name, 'initial.pdf');
  await render(
    h('div', { key: 'readonly' }, view({ value: initial, readOnly: true, multiple: false })),
  );
  const before = calls;
  await drag('drop', [file('blocked.pdf')]);
  await paste([file('blocked.pdf')]);
  assert.equal(calls, before);
  assert.equal(
    host.querySelector('[aria-label="파일 모두 지우기"]'),
    null,
    'no clear when read-only',
  );
  assert.equal(formData().get('resume').name, 'initial.pdf');
  await render(h('div', { key: 'disabled' }, view({ value: initial, disabled: true })));
  assert.equal(trigger().disabled, true);
  assert.equal(formData().get('resume'), null);
});

test('custom composition: asChild trigger, List as a function, event cancellation', async () => {
  let calls = 0;
  let pickerClicks = 0;
  await render(
    h(
      FileField,
      { 'aria-label': 'Files', multiple: true, onValueChange: () => calls++ },
      h(FileField.Trigger, { asChild: true }, h('button', null, 'Choose')),
      h(FileField.List, null, (files) =>
        files.map((item) =>
          h(FileField.Item, { key: item.name, file: item }, ({ index }) => `${index}:${item.name}`),
        ),
      ),
      h(FileField.Clear),
    ),
  );
  picker().addEventListener('click', () => pickerClicks++);
  await click(trigger());
  assert.equal(pickerClicks, 1);
  await upload([file('a.pdf'), file('b.pdf')]);
  assert.deepEqual(
    [...host.querySelectorAll('[role=list] > li')].map((item) => item.textContent),
    ['0:a.pdf', '1:b.pdf'],
  );
  assert.equal(calls, 1);
});

test('react-hook-form value mode: a File model, focus on error, reset and disabled omission', async () => {
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

test('sizes read in familiar units', async () => {
  const sized = (name, bytes) =>
    new window.File([new Uint8Array(bytes)], name, { type: 'application/pdf', lastModified: 1 });
  await render(
    tracked({
      multiple: true,
      defaultValue: [sized('a.pdf', 512), sized('b.pdf', 1536), sized('c.pdf', 23 * 1024 * 1024)],
    }).node,
  );
  assert.deepEqual(
    [...host.querySelectorAll('[data-file-field-item] [data-item-description]')].map(
      (size) => size.textContent,
    ),
    ['512 B', '1.5 KB', '23 MB'],
  );
});
