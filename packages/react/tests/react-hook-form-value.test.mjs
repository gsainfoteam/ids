import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost' });
for (const key of ['window', 'document', 'HTMLElement', 'HTMLInputElement', 'Event'])
  globalThis[key] = dom.window[key];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement: h, act } = await import('react');
const { createRoot } = await import('react-dom/client');
const { FormProvider, useForm } = await import('react-hook-form');
const { Field } = await import('../dist/react-hook-form.js');

let root, host;
afterEach(async () => {
  if (root) await act(async () => root.unmount());
  root = undefined;
  host?.remove();
});

function Stepper({ value, onValueChange, onBlur, id, ...rest }) {
  return h(
    'button',
    {
      id,
      type: 'button',
      'aria-invalid': rest['aria-invalid'],
      onBlur,
      onClick: () => onValueChange(value + 1),
    },
    String(value),
  );
}

test('value mode binds onValueChange as well as onChange, and keeps the consumer handler', async () => {
  let methods;
  const seen = [];
  function App() {
    methods = useForm({ defaultValues: { count: 1 } });
    return h(
      FormProvider,
      methods,
      h(
        Field,
        { name: 'count', controlMode: 'value' },
        h(Field.Label, null, 'Count'),
        h(Stepper, { onValueChange: (next) => seen.push(next) }),
      ),
    );
  }
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  await act(async () => root.render(h(App)));
  const button = host.querySelector('button');
  assert.equal(button.textContent, '1');
  await act(async () => button.click());
  assert.equal(methods.getValues('count'), 2);
  assert.equal(button.textContent, '2');
  assert.deepEqual(seen, [2]);
  await act(async () => methods.setValue('count', 7));
  assert.equal(button.textContent, '7');
});
