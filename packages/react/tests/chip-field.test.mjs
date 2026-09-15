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
const { ChipField, Field } = await import('../dist/index.js');
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
const trigger = () => host.querySelector('[role=combobox]');
const editor = () => host.querySelector('[type=text]');
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
const items = () => [
  h(
    ChipField.Group,
    { heading: 'Languages', key: 'g' },
    h(ChipField.Item, { value: 'js' }, 'JavaScript'),
    h(ChipField.Item, { value: 'ts' }, 'TypeScript'),
  ),
  h(ChipField.Item, { value: 'no', disabled: true, key: 'no' }, 'Unavailable'),
];
test('SSR Field labels and repeated FormData; no nested buttons; diagnostics', () => {
  const doc = new JSDOM(
    renderToString(
      h(
        'form',
        null,
        h(
          Field,
          { required: true },
          h(Field.Label, null, 'Skills'),
          h(ChipField, { name: 'skills', defaultValue: ['js', 'ts'] }, ...items()),
        ),
      ),
    ),
  ).window.document;
  assert.equal(doc.querySelector('label').htmlFor, doc.querySelector('[role=combobox]').id);
  assert.equal(doc.querySelector('[role=combobox]').getAttribute('aria-required'), 'true');
  assert.deepEqual(
    [...new doc.defaultView.FormData(doc.querySelector('form')).getAll('skills')],
    ['js', 'ts'],
  );
  assert.equal(doc.querySelector('button button'), null);
  assert.throws(() => renderToString(h(ChipField, { creatable: true })), /onCreate/);
  assert.throws(
    () => renderToString(h(ChipField, null, h(ChipField.Item, null, 'Bad'))),
    /value is required/,
  );
});
test('search, group filtering, keyboard selection, chip removal and maxCount', async () => {
  let value;
  await render(h(ChipField, { maxCount: 1, onChange: (v) => (value = v) }, ...items()));
  await type(trigger(), 'Type');
  assert.equal(host.querySelectorAll('[role=option]').length, 1);
  await key(trigger(), 'Enter');
  assert.deepEqual(value, ['ts']);
  assert.equal(trigger().value, '');
  assert.equal(host.querySelector('[role=option]').getAttribute('aria-disabled'), 'true');
  await key(trigger(), 'Escape');
  assert.equal(host.querySelector('[role=listbox]'), null);
  await key(trigger(), 'Backspace');
  assert.deepEqual(value, []);
  await key(trigger(), 'ArrowDown');
  await key(trigger(), 'Enter');
  assert.deepEqual(value, ['js']);
  await click(host.querySelector('[aria-label="JavaScript 삭제"]'));
  assert.deepEqual(value, []);
  assert.equal(document.activeElement, trigger());
});
test('creation trims input, prevents duplicates and IME commits, obeys limits', async () => {
  const created = [],
    changes = [];
  await render(
    h(
      ChipField,
      {
        creatable: true,
        onCreate: (v) => created.push(v),
        onChange: (v) => changes.push(v),
        maxCount: 2,
      },
      ...items(),
    ),
  );
  await type(trigger(), '  새 태그  ');
  await act(() =>
    trigger().dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true })),
  );
  await key(trigger(), 'Enter');
  assert.equal(created.length, 0);
  await act(() =>
    trigger().dispatchEvent(new CompositionEvent('compositionend', { bubbles: true })),
  );
  await key(trigger(), 'Enter');
  assert.deepEqual(created, ['새 태그']);
  assert.deepEqual(changes.at(-1), ['새 태그']);
  await type(trigger(), '새 태그');
  await key(trigger(), 'Enter');
  assert.equal(created.length, 1);
  await type(trigger(), 'JavaScript');
  await key(trigger(), 'Enter');
  assert.deepEqual(changes.at(-1), ['새 태그', 'js']);
  await type(trigger(), 'new');
  assert.equal(host.querySelectorAll('[role=option]').length, 0);
  await key(trigger(), 'Enter');
  assert.equal(created.length, 1);
});
test('native reset, prevented reset, readonly, disabled and explicit trigger composition', async () => {
  const view = (p) =>
    h(
      'form',
      null,
      h(
        ChipField,
        { name: 'skills', defaultValue: ['js'], ...p },
        h(
          ChipField.Trigger,
          null,
          h(ChipField.Value),
          h(ChipField.SearchField, { asChild: true }, h('input', { 'data-test': 'search' })),
        ),
        h(ChipField.Content, null, ...items()),
      ),
    );
  await render(view({}));
  await key(trigger(), 'Backspace');
  host.querySelector('form').addEventListener('reset', (e) => e.preventDefault(), { once: true });
  await act(async () => host.querySelector('form').reset());
  assert.equal(host.querySelector('[type=hidden]'), null);
  await act(async () => host.querySelector('form').reset());
  assert.equal(host.querySelector('[type=hidden]').value, 'js');
  await render(view({ readOnly: true }));
  await key(trigger(), 'Backspace');
  await click(trigger());
  assert.equal(host.querySelector('[role=listbox]'), null);
  assert.equal(host.querySelector('[type=hidden]').value, 'js');
  await render(view({ disabled: true }));
  assert.equal(trigger().disabled, true);
  assert.deepEqual([...new window.FormData(host.querySelector('form'))], []);
});
test('RHF array validation, focus, value, reset and disabled omission', async () => {
  const { Field: F } = await import('../dist/react-hook-form.js');
  const { FormProvider, useForm } = await import('react-hook-form');
  let methods, result;
  function App({ disabled = false }) {
    methods = useForm({ defaultValues: { tags: [] } });
    return h(
      FormProvider,
      methods,
      h(
        'form',
        { onSubmit: methods.handleSubmit((v) => (result = v)) },
        h(
          F,
          {
            name: 'tags',
            controlMode: 'value',
            disabled,
            registerOptions: { validate: (v) => v.length > 0 || 'Required' },
          },
          h(F.Label, null, 'Tags'),
          h(ChipField, null, ...items()),
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
  await type(trigger(), 'Type');
  await key(trigger(), 'Enter');
  await key(trigger(), 'Escape');
  await submit();
  assert.deepEqual(result.tags, ['ts']);
  await act(async () => methods.reset());
  assert.equal(host.querySelector('[type=hidden]'), null);
  await render(h(App, { disabled: true }));
  await submit();
  assert.equal(result.tags, undefined);
});
