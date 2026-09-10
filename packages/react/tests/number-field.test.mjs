import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
});
for (const name of [
  'window',
  'document',
  'HTMLElement',
  'HTMLInputElement',
  'Event',
  'InputEvent',
  'KeyboardEvent',
  'CompositionEvent',
  'WheelEvent',
])
  globalThis[name] = dom.window[name];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement: h, act, useState, Fragment } = await import('react');
const { createRoot } = await import('react-dom/client');
const { renderToString } = await import('react-dom/server');
const { Field, NumberField } = await import('../dist/index.js');
const { Field: FormField } = await import('../dist/react-hook-form.js');
const { FormProvider, useForm } = await import('react-hook-form');
let root;
let host;
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
const input = () => host.querySelector('input[role="spinbutton"]');
const hidden = () => host.querySelector('input[type="hidden"]');
const button = (label) => host.querySelector(`button[aria-label="${label}"]`);
async function focus() {
  await act(async () => input().focus());
}
async function blur() {
  await act(async () => input().blur());
}
async function type(value, composing = false) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input(), value);
    input().dispatchEvent(new InputEvent('input', { bubbles: true, isComposing: composing }));
  });
}
async function key(key, modifiers = {}) {
  let event;
  await act(async () => {
    event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...modifiers });
    input().dispatchEvent(event);
  });
  return event;
}
function controlled(props = {}) {
  let current;
  let set;
  const changes = [];
  function App() {
    [current, set] = useState(props.defaultValue ?? null);
    return h(NumberField, {
      ...props,
      value: current,
      onChange: (value) => {
        changes.push(value);
        set(value);
      },
      // An inline object must not erase a partial draft when the parent echoes a value.
      formatOptions: props.formatOptions ? { ...props.formatOptions } : undefined,
    });
  }
  return { node: h(App), value: () => current, set: (value) => set(value), changes };
}

test('SSR Field wiring, formatted ARIA, and canonical native FormData', () => {
  const markup = renderToString(
    h(
      'form',
      null,
      h(
        Field,
        { required: true, invalid: true, size: 'tiny' },
        h(Field.Label, null, 'Price'),
        h(NumberField, {
          name: 'price',
          defaultValue: 1234.5,
          min: 0,
          max: 2000,
          formatOptions: { style: 'currency', currency: 'USD' },
        }),
        h(Field.Error, null, 'Check price'),
      ),
    ),
  );
  const doc = new JSDOM(markup).window.document;
  const node = doc.querySelector('[role=spinbutton]');
  assert.equal(node.type, 'text');
  assert.equal(node.value, '$1,234.50');
  assert.equal(node.getAttribute('aria-valuenow'), '1234.5');
  assert.equal(node.getAttribute('aria-valuemin'), '0');
  assert.equal(node.getAttribute('aria-valuemax'), '2000');
  assert.equal(node.getAttribute('aria-valuetext'), '$1,234.50');
  assert.equal(node.dataset.size, 'tiny');
  assert.equal(doc.querySelector('label').htmlFor, node.id);
  assert.equal(
    doc.getElementById(node.getAttribute('aria-describedby')).textContent,
    'Check price',
  );
  assert.equal(node.required, true);
  assert.equal(node.getAttribute('aria-invalid'), 'true');
  assert.equal(new doc.defaultView.FormData(doc.querySelector('form')).get('price'), '1234.5');
  assert.equal(new doc.defaultView.FormData(doc.querySelector('form')).getAll('price').length, 1);
});
test('controlled partial drafts, negative/decimal values, zero, null and external updates', async () => {
  const form = controlled({ defaultValue: 1, formatOptions: { useGrouping: true } });
  await render(form.node);
  await focus();
  await type('-');
  assert.equal(input().value, '-');
  assert.equal(form.value(), null);
  await type('-0.');
  assert.equal(input().value, '-0.');
  assert.equal(form.value(), 0);
  await type('-0.25');
  assert.equal(form.value(), -0.25);
  await type('1.');
  assert.equal(input().value, '1.');
  await type('1.20');
  assert.equal(input().value, '1.20');
  assert.equal(form.value(), 1.2);
  await blur();
  assert.equal(input().value, '1.2');
  await act(async () => form.set(1234.5));
  assert.equal(input().value, '1,234.5');
  await focus();
  assert.equal(input().value, '1234.5');
  await type('');
  assert.equal(form.value(), null);
  assert.equal(input().getAttribute('aria-valuenow'), null);
  await type('.');
  await blur();
  assert.equal(input().value, '');
  assert.ok(
    form.changes.every(
      (value) => value === null || (typeof value === 'number' && Number.isFinite(value)),
    ),
  );
});
test('currency, locale decimal/grouping, percent paste and display-only precision', async () => {
  const form = controlled({
    defaultValue: 1234.567,
    formatOptions: { style: 'currency', currency: 'EUR' },
    locale: 'de-DE',
  });
  await render(form.node);
  assert.equal(input().value, '1.234,57 €');
  await focus();
  assert.equal(input().value, '1234,567');
  await type('2.345,67 €');
  assert.equal(form.value(), 2345.67);
  assert.equal(input().value, '2345,67');
  await blur();
  assert.equal(input().value, '2.345,67 €');
  await act(async () => root.unmount());
  root = undefined;
  const percent = controlled({
    defaultValue: 0.125,
    min: 0,
    max: 1,
    step: 0.01,
    formatOptions: { style: 'percent', minimumFractionDigits: 1 },
  });
  await render(percent.node);
  assert.equal(input().value, '12.5%');
  await focus();
  assert.equal(input().value, '0.125');
  await type('25%');
  assert.equal(percent.value(), 0.25);
  assert.equal(input().value, '0.25');
  await blur();
  assert.equal(input().value, '25.0%');
});
test('localized digits, accounting paste, and unknown/ambiguous characters are not misparsed', async () => {
  const form = controlled({
    locale: 'ar-EG',
    formatOptions: { style: 'currency', currency: 'USD', currencySign: 'accounting' },
  });
  await render(form.node);
  await focus();
  await type('١٬٢٣٤٫٥');
  assert.equal(form.value(), 1234.5);
  await type('(١٢٣٫٥)');
  assert.equal(form.value(), -123.5);
  await type('1e3');
  assert.equal(form.value(), -123.5);
  await type('1K');
  assert.equal(form.value(), -123.5);
  await type('--12');
  assert.equal(form.value(), -123.5);
  await type('１２');
  assert.equal(form.value(), 12);
});
test('min/max commit on blur/Enter, decimal/large steps, empty start and endpoint disabling', async () => {
  const form = controlled({ min: -1, max: 1, step: 0.1, largeStep: 0.5, defaultValue: 0.1 });
  await render(form.node);
  await focus();
  await key('ArrowUp');
  assert.equal(form.value(), 0.2);
  await key('ArrowUp');
  assert.equal(form.value(), 0.3);
  await key('ArrowUp', { shiftKey: true });
  assert.equal(form.value(), 0.8);
  await key('PageUp');
  assert.equal(form.value(), 1);
  assert.equal(button('Increase value').disabled, true);
  await key('ArrowDown');
  assert.equal(form.value(), 0.9);
  await type('-20');
  assert.equal(form.value(), -20);
  await blur();
  assert.equal(form.value(), -1);
  assert.equal(button('Decrease value').disabled, true);
  await focus();
  await type('20');
  await key('Enter');
  assert.equal(form.value(), 1);
  await type('');
  await key('ArrowUp');
  assert.equal(form.value(), 0.1);
  await act(async () => root.unmount());
  root = undefined;
  const positive = controlled({ min: 5, max: 10 });
  await render(positive.node);
  await key('ArrowUp');
  assert.equal(positive.value(), 5);
});
test('default large step, very small decimal arithmetic and scientific display retain numeric values', async () => {
  const form = controlled({
    defaultValue: 0.0000001,
    step: 0.0000001,
    formatOptions: { notation: 'scientific' },
  });
  await render(form.node);
  await focus();
  assert.equal(input().value, '0.0000001');
  await key('ArrowUp');
  assert.equal(form.value(), 0.0000002);
  await key('ArrowUp', { shiftKey: true });
  assert.equal(form.value(), 0.0000012);
  await blur();
  assert.equal(input().value, '1.2E-6');
});
test('default largeStep scales decimal 0.07 exactly, and tiny values remain visible', async () => {
  const form = controlled({ defaultValue: 0, step: 0.07 });
  await render(form.node);
  await focus();
  await key('ArrowUp', { shiftKey: true });
  assert.equal(form.value(), 0.7);
  await act(async () => form.set(1e-25));
  await blur();
  assert.equal(input().value, '0.0000000000000000000000001');
});
test('sentinel/asChild forwards refs and events, explicit Stepper is not duplicated, Clear null/override', async () => {
  let seen;
  let cleanups = 0;
  const events = [];
  const form = controlled({
    defaultValue: 10,
    ref: (node) => {
      seen = node;
      return () => cleanups++;
    },
    onFocus: () => events.push('root-focus'),
    children: h(
      Fragment,
      null,
      h('span', null, '$'),
      h(
        NumberField.Input,
        { asChild: true, onFocus: () => events.push('input-focus') },
        h('input', { onFocus: () => events.push('child-focus') }),
      ),
      h(NumberField.Clear, { asChild: true }, h('button', null, 'Clear')),
      h(NumberField.Stepper, { asChild: true }, h('span', { 'data-testid': 'custom-stepper' })),
    ),
  });
  await render(form.node);
  assert.equal(seen, input());
  assert.equal(host.querySelectorAll('[data-number-field-stepper]').length, 1);
  await focus();
  assert.deepEqual(events, ['child-focus', 'input-focus', 'root-focus']);
  await act(async () => button('Increase value').click());
  assert.equal(form.value(), 11);
  assert.equal(document.activeElement, input());
  await act(async () => button('Clear value').click());
  assert.equal(form.value(), null);
  assert.equal(button('Clear value'), null);
  assert.equal(document.activeElement, input());
  await act(async () => root.unmount());
  root = undefined;
  assert.ok(cleanups > 0);
  let clears = 0;
  await render(
    h(
      NumberField,
      { defaultValue: 5 },
      h(NumberField.Input),
      h(NumberField.Clear, { onClear: () => clears++ }),
    ),
  );
  await act(async () => button('Clear value').click());
  assert.equal(clears, 1);
  assert.equal(input().value, '5');
});
test('readOnly/disabled, custom key cancellation, wheel and native editing shortcuts', async () => {
  const changes = [];
  await render(
    h(
      Field,
      { disabled: true, invalid: false },
      h(NumberField, { defaultValue: 5, invalid: true, onChange: (value) => changes.push(value) }),
    ),
  );
  assert.equal(input().disabled, true);
  assert.equal(input().getAttribute('aria-invalid'), 'false');
  await key('ArrowUp');
  assert.deepEqual(changes, []);
  await render(h(NumberField, { defaultValue: 5, readOnly: true }));
  assert.equal(button('Increase value').disabled, true);
  await key('ArrowUp');
  assert.equal(input().value, '5');
  await render(
    h(NumberField, {
      defaultValue: 5,
      onKeyDown: (event) => {
        if (event.key === 'ArrowUp') event.preventDefault();
      },
    }),
  );
  await focus();
  await key('ArrowUp');
  assert.equal(input().value, '5');
  assert.equal((await key('a')).defaultPrevented, true);
  assert.equal((await key('a', { ctrlKey: true })).defaultPrevented, false);
  assert.equal((await key('Home')).defaultPrevented, false);
  await key('ArrowDown', { metaKey: true });
  assert.equal(input().value, '5');
  await act(async () =>
    input().dispatchEvent(new WheelEvent('wheel', { deltaY: -100, bubbles: true })),
  );
  assert.equal(input().value, '5');
  assert.equal(document.activeElement, input());
});
test('IME composition defers conversion and stepping until composition ends', async () => {
  const form = controlled({ defaultValue: 1 });
  await render(form.node);
  await focus();
  await act(async () =>
    input().dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true })),
  );
  await type('１２', true);
  assert.equal(form.value(), 1);
  assert.equal(input().value, '１２');
  await key('ArrowUp', { isComposing: true });
  assert.equal(form.value(), 1);
  await act(async () =>
    input().dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '１２' })),
  );
  assert.equal(form.value(), 12);
  assert.equal(input().value, '12');
});
test('native reset restores uncontrolled value and FormData, canceled reset preserves edits', async () => {
  await render(h('form', null, h(NumberField, { name: 'quantity', defaultValue: 5 })));
  await focus();
  await type('8');
  assert.equal(hidden().value, '8');
  await act(async () => host.querySelector('form').reset());
  assert.equal(input().value, '5');
  assert.equal(hidden().value, '5');
  await type('9');
  host
    .querySelector('form')
    .addEventListener('reset', (event) => event.preventDefault(), { once: true });
  await act(async () => host.querySelector('form').reset());
  assert.equal(input().value, '9');
});
test('Zod + RHF value adapter: number/null validation, focus, numeric submit, setValue/reset and disabled omission', async () => {
  const { zodResolver } = await import('@hookform/resolvers/zod');
  const { z } = await import('zod');
  const schema = z.object({
    quantity: z
      .number()
      .nullable()
      .refine((value) => value != null, 'Required quantity'),
  });
  let methods;
  let result;
  function App({ disabled = false }) {
    methods = useForm({ resolver: zodResolver(schema), defaultValues: { quantity: null } });
    return h(
      FormProvider,
      methods,
      h(
        'form',
        {
          noValidate: true,
          onSubmit: methods.handleSubmit((value) => {
            result = value;
          }),
        },
        h(
          FormField,
          { name: 'quantity', controlMode: 'value', disabled },
          h(FormField.Label, null, 'Quantity'),
          h(NumberField, { min: 1, max: 99 }),
          h(FormField.Error),
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
  assert.equal(host.querySelector('[data-field-part=error]').textContent, 'Required quantity');
  assert.equal(document.activeElement, input());
  await type('12');
  assert.equal(methods.getValues('quantity'), 12);
  await submit();
  assert.deepEqual(result, { quantity: 12 });
  assert.equal(typeof result.quantity, 'number');
  await act(async () => methods.setValue('quantity', 7));
  assert.equal(input().value, '7');
  await act(async () => methods.reset());
  assert.equal(input().value, '');
  assert.equal(methods.getValues('quantity'), null);
  await act(async () => methods.setValue('quantity', 7));
  await render(h(App, { disabled: true }));
  assert.equal(input().disabled, true);
  assert.equal(hidden().disabled, true);
  await submit();
  assert.equal(result.quantity, undefined);
});
test('invalid props/structures fail clearly and hideStepper removes automatic controls', () => {
  for (const props of [
    { min: 5, max: 1 },
    { step: 0 },
    { step: -1 },
    { largeStep: Infinity },
    { value: NaN },
  ])
    assert.throws(() => renderToString(h(NumberField, props)), /\[IDS\] NumberField/);
  assert.throws(
    () => renderToString(h(NumberField, null, h(NumberField.Input), h(NumberField.Input))),
    /Input/,
  );
  const markup = renderToString(h(NumberField, { hideStepper: true }));
  assert.equal(new JSDOM(markup).window.document.querySelector('button'), null);
});
