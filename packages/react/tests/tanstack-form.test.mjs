import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost' });
for (const key of [
  'window',
  'document',
  'Node',
  'Element',
  'HTMLElement',
  'HTMLInputElement',
  'Event',
  'FocusEvent',
  'MouseEvent',
  'MutationObserver',
  'getComputedStyle',
])
  globalThis[key] = dom.window[key];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement: h, act } = await import('react');
const { createRoot } = await import('react-dom/client');
const { createFormHook, createFormHookContexts, useForm } = await import('@tanstack/react-form');
const { Checkbox, TextField } = await import('../dist/index.js');
const { Field } = await import('../dist/tanstack-form.js');

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
const fieldOf = (control) => control.closest('[data-field]');
const type = (input, value) =>
  act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
const blur = (node) =>
  act(async () => {
    node.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    node.dispatchEvent(new FocusEvent('blur'));
  });

const mustBeEmail = ({ value }) => (value.includes('@') ? undefined : 'Enter an email address');

function Stepper({ value, onValueChange, onBlur, id }) {
  return h(
    'button',
    { id, type: 'button', onBlur, onClick: () => onValueChange(value + 1) },
    String(value),
  );
}

test('form.Field: typing reaches the form, and a blur shows the error on the field', async () => {
  let form;
  function App() {
    form = useForm({ defaultValues: { email: '' } });
    return h(form.Field, { name: 'email', validators: { onBlur: mustBeEmail } }, (field) =>
      h(Field, { field }, h(Field.Label, null, 'Email'), h(TextField), h(Field.Error)),
    );
  }
  await render(h(App));
  const input = host.querySelector('input');
  assert.equal(input.name, 'email');
  assert.equal(host.querySelector('label').htmlFor, input.id);
  await type(input, 'ids');
  assert.equal(form.state.values.email, 'ids');
  assert.ok(fieldOf(input).hasAttribute('data-dirty'));
  assert.equal(fieldOf(input).hasAttribute('data-invalid'), false, 'no error before the blur');
  await blur(input);
  assert.ok(fieldOf(input).hasAttribute('data-touched'));
  assert.ok(fieldOf(input).hasAttribute('data-invalid'));
  assert.equal(host.querySelector('[data-field-part=error]').textContent, 'Enter an email address');
  assert.equal(input.getAttribute('aria-invalid'), 'true');
  await type(input, 'ids@gist.ac.kr');
  await blur(input);
  assert.equal(fieldOf(input).hasAttribute('data-invalid'), false);
  await act(async () => form.reset());
  assert.equal(input.value, '');
  assert.equal(fieldOf(input).hasAttribute('data-dirty'), false);
});

test('an error found by a submit shows before the field was touched', async () => {
  let form;
  function App() {
    form = useForm({ defaultValues: { email: '' }, onSubmit: () => {} });
    return h(form.Field, { name: 'email', validators: { onSubmit: mustBeEmail } }, (field) =>
      h(Field, { field }, h(Field.Label, null, 'Email'), h(TextField), h(Field.Error)),
    );
  }
  await render(h(App));
  const input = host.querySelector('input');
  assert.equal(fieldOf(input).hasAttribute('data-invalid'), false);
  await act(async () => form.handleSubmit());
  assert.ok(fieldOf(input).hasAttribute('data-invalid'));
  assert.equal(host.querySelector('[data-field-part=error]').textContent, 'Enter an email address');
});

test('form.AppField: Field finds its field without a prop, in value and checked modes', async () => {
  const { fieldContext, formContext } = createFormHookContexts();
  const { useAppForm } = createFormHook({
    fieldContext,
    formContext,
    fieldComponents: { Field },
    formComponents: {},
  });
  let form;
  const seen = [];
  function App() {
    form = useAppForm({ defaultValues: { count: 1, terms: false } });
    return h(
      'div',
      null,
      h(form.AppField, { name: 'count' }, (field) =>
        h(
          field.Field,
          null,
          h(Field.Label, null, 'Count'),
          h(Stepper, { onValueChange: (next) => seen.push(next) }),
        ),
      ),
      h(form.AppField, { name: 'terms' }, (field) =>
        h(field.Field, { controlMode: 'checked' }, h(Field.Label, null, 'Terms'), h(Checkbox)),
      ),
    );
  }
  await render(h(App));
  const stepper = host.querySelector('button');
  await act(async () => stepper.click());
  assert.equal(form.state.values.count, 2);
  assert.equal(stepper.textContent, '2');
  assert.deepEqual(seen, [2], "the consumer's own handler still runs");
  const box = host.querySelector('input[type=checkbox]');
  await act(async () => box.click());
  assert.equal(form.state.values.terms, true);
  assert.equal(box.checked, true);
  await act(async () => form.setFieldValue('terms', false));
  assert.equal(box.checked, false);
});

test('a native input reports its value, not its event', async () => {
  let form;
  function App() {
    form = useForm({ defaultValues: { nickname: 'ids' } });
    return h(form.Field, { name: 'nickname' }, (field) =>
      h(Field, { field }, h(Field.Label, null, 'Nickname'), h('input')),
    );
  }
  await render(h(App));
  const input = host.querySelector('input');
  assert.equal(input.value, 'ids');
  await type(input, 'infoteam');
  assert.equal(form.state.values.nickname, 'infoteam');
});

test('without a field it renders a plain Field and warns in development', async () => {
  const warnings = [];
  const original = console.warn;
  console.warn = (message) => warnings.push(String(message));
  try {
    await render(h(Field, null, h(Field.Label, null, 'Name'), h(TextField)));
    assert.ok(host.querySelector('input'));
    assert.ok(warnings.some((warning) => warning.includes('TanStack Form')));
  } finally {
    console.warn = original;
  }
});
