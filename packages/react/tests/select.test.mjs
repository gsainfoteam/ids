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
const { Select, Field } = await import('../dist/index.js');
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
  await act(() => root.render(node));
}
const items = () => [
  h(Select.Item, { key: 'a', value: 'apple' }, 'Apple'),
  h(Select.Item, { key: 'b', value: 'banana', disabled: true }, 'Banana'),
  h(Select.Item, { key: 'c', value: 'cherry' }, 'Cherry'),
];
const trigger = () => host.querySelector('button');
async function key(node, key) {
  await act(() =>
    node.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })),
  );
}
async function click(node) {
  await act(() => node.click());
}
async function type(node, value) {
  await act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(node, value);
    node.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
test('SSR labels, size, invalid, multiple native FormData and duplicate diagnostics', () => {
  const doc = new JSDOM(
    renderToString(
      h(
        'form',
        null,
        h(
          Field,
          { size: 'tiny', invalid: true, required: true },
          h(Field.Label, null, 'Fruit'),
          h(
            Select,
            { name: 'fruit', selectionMode: 'multiple', defaultValue: ['apple', 'cherry'] },
            ...items(),
          ),
          h(Field.Error, null, 'Error'),
        ),
      ),
    ),
  ).window.document;
  const button = doc.querySelector('button');
  assert.equal(button.id, doc.querySelector('label').htmlFor);
  assert.equal(button.getAttribute('aria-invalid'), 'true');
  assert.equal(button.getAttribute('aria-required'), 'true');
  assert.ok(button.textContent.includes('Apple, Cherry'));
  assert.deepEqual(
    [...new doc.defaultView.FormData(doc.querySelector('form'))],
    [
      ['fruit', 'apple'],
      ['fruit', 'cherry'],
    ],
  );
  assert.throws(
    () =>
      renderToString(
        h(Select, null, h(Select.Item, { value: 'a' }), h(Select.Item, { value: 'a' })),
      ),
    /duplicate/,
  );
  assert.throws(
    () => renderToString(h(Select, { selectionMode: 'multiple', value: 'bad' })),
    /string/,
  );
});
test('keyboard skips disabled options, commits and restores focus; Escape cancels navigation', async () => {
  let value;
  await render(h(Select, { onChange: (v) => (value = v) }, ...items()));
  await key(trigger(), 'ArrowDown');
  assert.ok(host.querySelector('[role=listbox]'));
  await key(trigger(), 'ArrowDown');
  assert.ok(trigger().getAttribute('aria-activedescendant').endsWith('cherry'));
  await key(trigger(), 'Enter');
  assert.equal(value, 'cherry');
  assert.equal(document.activeElement, trigger());
  assert.equal(host.querySelector('[role=listbox]'), null);
  await key(trigger(), 'ArrowDown');
  await key(trigger(), 'Home');
  await key(trigger(), 'Escape');
  assert.equal(value, 'cherry');
  assert.ok(trigger().textContent.includes('Cherry'));
});
test('search, empty state, multiple toggles, disabled guard, outside dismissal and reset', async () => {
  let changes = [];
  await render(
    h(
      'form',
      null,
      h(
        Select,
        {
          name: 'fruit',
          selectionMode: 'multiple',
          defaultValue: ['apple'],
          onChange: (v) => changes.push(v),
        },
        h(Select.SearchField),
        ...items(),
        h(Select.Empty, null, 'No fruit'),
      ),
      h('button', { type: 'reset' }, 'Reset'),
    ),
  );
  await click(trigger());
  const search = host.querySelector('[role=combobox][type=text]');
  assert.equal(document.activeElement, search);
  await type(search, 'xyz');
  assert.ok(host.textContent.includes('No fruit'));
  assert.equal(host.querySelectorAll('[role=option]').length, 0);
  await type(search, 'ch');
  await key(search, 'Enter');
  assert.deepEqual(changes.at(-1), ['apple', 'cherry']);
  assert.ok(host.querySelector('[role=listbox]'));
  await type(search, '');
  await click([...host.querySelectorAll('[role=option]')][1]);
  assert.equal(changes.length, 1);
  await click([...host.querySelectorAll('[role=option]')][0]);
  assert.deepEqual(changes.at(-1), ['cherry']);
  await key(search, 'Tab');
  assert.equal(host.querySelector('[role=listbox]'), null);
  await act(async () => host.querySelector('form').reset());
  assert.equal(host.querySelector('[type=hidden]').value, 'apple');
  await click(trigger());
  await act(() => document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true })));
  assert.equal(host.querySelector('[role=listbox]'), null);
});
test('readonly/disabled prevent opening and external value changes do not emit', async () => {
  let changes = 0;
  const view = (props) => h(Select, { onChange: () => changes++, ...props }, ...items());
  await render(view({ readOnly: true, value: 'apple' }));
  await click(trigger());
  assert.equal(host.querySelector('[role=listbox]'), null);
  await render(view({ disabled: true, value: 'cherry' }));
  assert.equal(trigger().disabled, true);
  assert.ok(trigger().textContent.includes('Cherry'));
  assert.equal(changes, 0);
});
test('RHF value adapter: errors focus trigger, selection submits, reset and disabled omission', async () => {
  const { Field: F } = await import('../dist/react-hook-form.js');
  const { FormProvider, useForm } = await import('react-hook-form');
  let methods, result;
  function App({ disabled = false }) {
    methods = useForm({ defaultValues: { fruit: null } });
    return h(
      FormProvider,
      methods,
      h(
        'form',
        { onSubmit: methods.handleSubmit((v) => (result = v)) },
        h(
          F,
          {
            name: 'fruit',
            controlMode: 'value',
            registerOptions: { required: 'Choose fruit' },
            disabled,
          },
          h(F.Label, null, 'Fruit'),
          h(Select, null, ...items()),
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
  await click(trigger());
  await click(host.querySelector('[role=option]'));
  assert.equal(methods.getValues('fruit'), 'apple');
  await submit();
  assert.deepEqual(result, { fruit: 'apple' });
  await act(async () => methods.reset());
  assert.ok(trigger().textContent.includes('선택하세요'));
  await act(async () => methods.setValue('fruit', 'cherry'));
  assert.ok(trigger().textContent.includes('Cherry'));
  await render(h(App, { disabled: true }));
  await submit();
  assert.equal(result.fruit, undefined);
});

test('explicit asChild Content/Group collect items and allow empty string option values', async () => {
  await render(
    h(
      Select,
      null,
      h(Select.Trigger, { asChild: true }, h('button', null, 'Open')),
      h(
        Select.Content,
        { asChild: true },
        h(
          'section',
          null,
          h(
            Select.Group,
            { heading: 'Values', asChild: true },
            h('section', null, h(Select.Item, { value: '' }, 'Empty')),
          ),
        ),
      ),
    ),
  );
  await click(trigger());
  assert.equal(host.querySelectorAll('[role=option]').length, 1);
  await key(trigger(), 'Enter');
  assert.equal(host.querySelector('[role=listbox]'), null);
});

test('keyboard navigation only scrolls the popup containing the active option', async () => {
  await render(h(Select, null, ...items()));
  await click(trigger());
  const popup = host.querySelector('[data-field-popup]');
  const cherry = host.querySelector('[role=option]:last-child');
  popup.getBoundingClientRect = () => ({ top: 100, bottom: 300 });
  Object.defineProperties(popup, { clientTop: { value: 0 }, clientHeight: { value: 200 } });
  cherry.getBoundingClientRect = () => ({ top: 320, bottom: 360 });
  cherry.scrollIntoView = () => assert.fail('must not scroll document ancestors');
  await key(trigger(), 'End');
  assert.equal(popup.scrollTop, 60);
});
