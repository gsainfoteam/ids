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
])
  globalThis[key] = dom.window[key];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement: h, act, useState } = await import('react');
const { createRoot } = await import('react-dom/client');
const { renderToString } = await import('react-dom/server');
const { Input, Field, NumberField } = await import('../dist/index.js');
const { Field: RhfField } = await import('../dist/react-hook-form.js');
const { useForm, FormProvider } = await import('react-hook-form');
let root, host;
afterEach(async () => {
  if (root) await act(async () => root.unmount());
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
const input = () => host.querySelector('input:not([type=hidden])');
async function type(node, value) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(node, value);
    node.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
async function click(selector) {
  await act(async () => host.querySelector(selector).click());
}

test('SSR dispatch preserves native types, Field labels, sizes, invalid state and number semantics', () => {
  for (const type of ['text', 'email', 'url', 'search', 'number', 'password', 'tel']) {
    const markup = renderToString(
      h(
        Field,
        { invalid: true, required: true, size: 'tiny' },
        h(Field.Label, null, type),
        h(Input, { type, name: type }),
        h(Field.Error, null, 'Required'),
      ),
    );
    const doc = new JSDOM(markup).window.document;
    const node = doc.querySelector('input:not([type=hidden])');
    assert.equal(node.type, type === 'number' ? 'text' : type);
    assert.equal(doc.querySelector('label').htmlFor, node.id);
    assert.equal(node.getAttribute('aria-invalid'), 'true');
    assert.equal(node.required, true);
    assert.equal(doc.getElementById(node.getAttribute('aria-describedby')).textContent, 'Required');
    if (type === 'number') assert.equal(node.getAttribute('role'), 'spinbutton');
  }
});
test('uncontrolled search clear emits one native change, retains focus and supports form reset', async () => {
  const values = [];
  let ref;
  await render(
    h(
      'form',
      null,
      h(Input, {
        type: 'search',
        name: 'q',
        defaultValue: 'IDS',
        ref: (node) => {
          ref = node;
        },
        onChange: (e) => values.push([e.target.value, e.target.name, e.type]),
      }),
    ),
  );
  assert.equal(ref, input());
  await click('button');
  assert.equal(input().value, '');
  assert.deepEqual(values, [['', 'q', 'change']]);
  assert.equal(document.activeElement, input());
  await act(async () => host.querySelector('form').reset());
  assert.equal(input().value, 'IDS');
  await type(input(), 'again');
  assert.equal(input().value, 'again');
});
test('controlled search clear respects owner state, then accepts external updates', async () => {
  let update;
  const values = [];
  function Demo() {
    const [value, setValue] = useState('first');
    update = setValue;
    return h(Input, {
      type: 'search',
      value,
      onChange: (e) => {
        values.push(e.target.value);
        setValue(e.target.value);
      },
    });
  }
  await render(h(Demo));
  await click('button');
  assert.deepEqual(values, ['']);
  assert.equal(input().value, '');
  await act(async () => update('external'));
  assert.equal(input().value, 'external');
});
test('search readonly/disabled prevent clear; native input ref cleans up', async () => {
  let cleaned = 0;
  for (const blocked of ['readOnly', 'disabled']) {
    await render(
      h(Input, {
        type: 'search',
        defaultValue: 'keep',
        [blocked]: true,
        ref: () => () => cleaned++,
      }),
    );
    assert.equal(host.querySelector('button').disabled, true);
    await click('button');
    assert.equal(input().value, 'keep');
  }
  await render(null);
  assert.ok(cleaned > 0);
});
test('number compound children and numeric callback pass through Input', async () => {
  const values = [];
  await render(
    h(
      Input,
      { type: 'number', defaultValue: 2, min: 0, step: 0.5, onChange: (v) => values.push(v) },
      h(NumberField.Input),
      h(NumberField.Clear),
    ),
  );
  await click('button[aria-label="Increase value"]');
  assert.deepEqual(values, [2.5]);
  await click('button[aria-label="Clear value"]');
  assert.equal(values.at(-1), null);
});
test('RHF native search and controlled number/tel retain value types, clear, reset and error focus', async () => {
  let methods;
  function Form() {
    methods = useForm({ defaultValues: { query: 'default', count: 2, phone: '' } });
    return h(
      FormProvider,
      methods,
      h(
        'form',
        null,
        h(
          RhfField,
          { name: 'query' },
          h(RhfField.Label, null, 'Search'),
          h(Input, { type: 'search' }),
        ),
        h(RhfField, { name: 'count', controlMode: 'value' }, h(Input, { type: 'number' })),
        h(
          RhfField,
          { name: 'phone', controlMode: 'value' },
          h(Input, { type: 'tel', format: 'none' }),
        ),
      ),
    );
  }
  await render(h(Form));
  await click('button[aria-label="검색어 지우기"]');
  assert.equal(methods.getValues('query'), '');
  await type(host.querySelector('[role=spinbutton]'), '3');
  await type(host.querySelector('[type=tel]'), '01012345678');
  assert.equal(methods.getValues('count'), 3);
  assert.equal(typeof methods.getValues('phone'), 'string');
  await act(async () => methods.reset({ query: 'reset', count: 5, phone: '123' }));
  assert.equal(host.querySelector('[type=search]').value, 'reset');
  assert.equal(host.querySelector('[role=spinbutton]').value, '5');
  await act(async () => methods.setError('count', { message: 'Invalid' }, { shouldFocus: true }));
  assert.equal(document.activeElement, host.querySelector('[role=spinbutton]'));
});
test('unsupported runtime type falls back to text; explicit aria-invalid wins', async () => {
  await render(h(Input, { type: 'date', invalid: true, 'aria-invalid': false }));
  assert.equal(input().type, 'text');
  assert.equal(input().getAttribute('aria-invalid'), 'false');
});
