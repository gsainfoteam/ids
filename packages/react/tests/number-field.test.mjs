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
  'MouseEvent',
  'FocusEvent',
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
async function beforeInput(data, inputType = 'insertText', init = {}) {
  let event;
  await act(async () => {
    event = new InputEvent('beforeinput', {
      data,
      inputType,
      bubbles: true,
      cancelable: true,
      ...init,
    });
    input().dispatchEvent(event);
  });
  return event;
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
    const inlineObjectEachRender = props.formatOptions ? { ...props.formatOptions } : undefined;
    return h(NumberField, {
      ...props,
      value: current,
      onValueChange: (value) => {
        changes.push(value);
        set(value);
      },
      formatOptions: inlineObjectEachRender,
    });
  }
  return { node: h(App), value: () => current, set: (value) => set(value), changes };
}

const resetSettles = () => new Promise((resolve) => setTimeout(resolve));

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
  assert.equal(doc.querySelector('[data-number-field]').dataset.size, 'tiny');
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
  assert.equal(input().value, '1,234.5', 'the formatted text is edited in place');
  await type('1,234.56');
  assert.equal(form.value(), 1234.56);
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
test('currency, locale decimal/grouping, percent typing and display-only precision', async () => {
  const form = controlled({
    defaultValue: 1234.567,
    formatOptions: { style: 'currency', currency: 'EUR' },
    locale: 'de-DE',
  });
  await render(form.node);
  assert.equal(input().value, '1.234,57 €');
  await focus();
  assert.equal(input().value, '1.234,57 €');
  await type('2.345,67 €');
  assert.equal(form.value(), 2345.67);
  assert.equal(input().value, '2.345,67 €');
  await type('2.345,678');
  await blur();
  assert.equal(input().value, '2.345,68 €');
  assert.equal(form.value(), 2345.678, 'rounding is for display only');
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
  assert.equal(input().value, '12.5%');
  await type('25');
  assert.equal(percent.value(), 0.25, 'a percent field is typed in percent');
  await type('%');
  assert.equal(percent.value(), null, 'a sign without digits is no value yet');
  await type('25%');
  assert.equal(percent.value(), 0.25);
  await blur();
  assert.equal(input().value, '25.0%');
});
test('localized digits and accounting parentheses parse; text that is no number is refused', async () => {
  const arabic = controlled({ locale: 'ar-EG' });
  await render(arabic.node);
  await focus();
  await type('١٬٢٣٤٫٥');
  assert.equal(arabic.value(), 1234.5);
  for (const text of ['1e3', '1K', '--12', 'abc']) {
    await type(text);
    assert.equal(arabic.value(), 1234.5, `${text} is refused`);
    assert.equal(input().value, '١٬٢٣٤٫٥', `${text} leaves the text as it was`);
  }
  await type('１２');
  assert.equal(arabic.value(), 12);
  await act(async () => root.unmount());
  root = undefined;
  const accounting = controlled({
    formatOptions: { style: 'currency', currency: 'USD', currencySign: 'accounting' },
  });
  await render(accounting.node);
  await focus();
  await type('(');
  assert.equal(input().value, '(');
  assert.equal(accounting.value(), null);
  await type('(123.5)');
  assert.equal(accounting.value(), -123.5);
  await blur();
  assert.equal(input().value, '($123.50)');
});
test('edits that cannot become a number are refused before they land', async () => {
  const form = controlled({ defaultValue: 12, min: 0 });
  await render(form.node);
  await focus();
  input().setSelectionRange(1, 1);
  assert.equal((await beforeInput('x')).defaultPrevented, true);
  assert.equal((await beforeInput('3')).defaultPrevented, false);
  input().setSelectionRange(0, 0);
  assert.equal((await beforeInput('-')).defaultPrevented, true, 'min 0 refuses a minus sign');
  assert.equal((await beforeInput('abc', 'insertFromPaste')).defaultPrevented, true);
  assert.equal((await beforeInput(' 1,000 ', 'insertFromPaste')).defaultPrevented, false);
  input().setSelectionRange(0, 2);
  assert.equal((await beforeInput(null, 'deleteContentBackward')).defaultPrevented, false);
  assert.equal((await beforeInput(null, 'historyUndo')).defaultPrevented, false);
  assert.equal(
    (await beforeInput('x', 'insertCompositionText', { isComposing: true })).defaultPrevented,
    false,
    'a composition is judged when it ends',
  );
  await render(h(NumberField, { key: 'signed', defaultValue: 12 }));
  await focus();
  input().setSelectionRange(0, 0);
  assert.equal((await beforeInput('-')).defaultPrevented, false);
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
  assert.equal(button('값 늘리기').disabled, true);
  await key('ArrowDown');
  assert.equal(form.value(), 0.9);
  await type('-20');
  assert.equal(form.value(), -20);
  await blur();
  assert.equal(form.value(), -1);
  assert.equal(button('값 줄이기').disabled, true);
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
test('default large step and very small decimal arithmetic keep exact values', async () => {
  const form = controlled({ defaultValue: 0.0000001, step: 0.0000001 });
  await render(form.node);
  await focus();
  assert.equal(input().value, '0.0000001');
  await key('ArrowUp');
  assert.equal(form.value(), 0.0000002);
  await key('ArrowUp', { shiftKey: true });
  assert.equal(form.value(), 0.0000012);
  await blur();
  assert.equal(input().value, '0.0000012');
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
  assert.deepEqual(events, ['child-focus', 'root-focus', 'input-focus']);
  await act(async () => button('값 늘리기').click());
  assert.equal(form.value(), 11);
  assert.equal(document.activeElement, input());
  await act(async () => button('지우기').click());
  assert.equal(form.value(), null);
  assert.equal(button('지우기'), null);
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
      h(NumberField.Clear, {
        onClick: (event) => {
          clears++;
          event.preventDefault();
        },
      }),
    ),
  );
  await act(async () => button('지우기').click());
  assert.equal(clears, 1);
  assert.equal(input().value, '5', 'preventDefault keeps the value');
});
test('readOnly/disabled, custom key cancellation, wheel and native editing shortcuts', async () => {
  const changes = [];
  await render(
    h(
      Field,
      { disabled: true, invalid: false },
      h(NumberField, {
        defaultValue: 5,
        invalid: true,
        onValueChange: (value) => changes.push(value),
      }),
    ),
  );
  assert.equal(input().disabled, true);
  assert.equal(input().getAttribute('aria-invalid'), 'false');
  await key('ArrowUp');
  assert.deepEqual(changes, []);
  await render(h(NumberField, { defaultValue: 5, readOnly: true }));
  assert.equal(button('값 늘리기').disabled, true);
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
  assert.equal((await beforeInput('a')).defaultPrevented, true);
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
  await act(async () => {
    host.querySelector('form').reset();
    await resetSettles();
  });
  assert.equal(input().value, '5');
  assert.equal(hidden().value, '5');
  await type('9');
  host
    .querySelector('form')
    .addEventListener('reset', (event) => event.preventDefault(), { once: true });
  await act(async () => {
    host.querySelector('form').reset();
    await resetSettles();
  });
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
    { formatOptions: { notation: 'scientific' } },
  ])
    assert.throws(() => renderToString(h(NumberField, props)), /\[IDS\] NumberField/);
  for (const node of [
    h(NumberField, null, h(NumberField.Input), h(NumberField.Input)),
    h(NumberField, null, h(NumberField.Input, { asChild: true }, h('textarea'))),
    h(NumberField, null, h(NumberField.Input, null, 'text')),
  ])
    assert.throws(() => renderToString(node), /\[IDS\] `<NumberField/);
  assert.throws(
    () => renderToString(h(NumberField.Input)),
    /`<NumberField.Input>` must be used inside `<NumberField>`/,
  );
  const markup = renderToString(h(NumberField, { hideStepper: true }));
  assert.equal(new JSDOM(markup).window.document.querySelector('button'), null);
});

const shell = () => host.querySelector('[data-number-field]');
const layout = () =>
  Array.from(shell().children, (el) =>
    'numberFieldAdornment' in el.dataset
      ? el.textContent
      : 'numberFieldStepper' in el.dataset
        ? 'STEPPER'
        : el.tagName,
  );

test('Input values win over root values, but root and Input handlers both run', async () => {
  const events = [];
  await render(
    h(
      NumberField,
      {
        id: 'root-id',
        placeholder: 'root',
        defaultValue: 1,
        onChange: () => events.push('root-change'),
        onValueChange: (value) => events.push(['root-value', value]),
        onBlur: () => events.push('root-blur'),
      },
      h(NumberField.Input, {
        placeholder: 'input',
        onChange: () => events.push('input-change'),
        onBlur: () => events.push('input-blur'),
      }),
    ),
  );
  assert.equal(input().id, 'root-id');
  assert.equal(input().placeholder, 'input');
  await focus();
  await type('4');
  await blur();
  assert.deepEqual(events, [
    'root-change',
    'input-change',
    ['root-value', 4],
    'root-blur',
    'input-blur',
  ]);
});

test('Input disabled/readOnly override the root and drive container state', async () => {
  await render(
    h(NumberField, { defaultValue: 1, disabled: true }, h(NumberField.Input, { disabled: false })),
  );
  assert.equal(input().disabled, false);
  assert.equal(shell().dataset.disabled, undefined);
  await render(h(NumberField, { defaultValue: 1 }, h(NumberField.Input, { readOnly: true })));
  assert.equal(shell().dataset.readonly, '');
  assert.equal(button('값 늘리기').disabled, true);
});

test('children without an Input become leading adornments before an auto-inserted Input', async () => {
  await render(h(NumberField, { defaultValue: 1 }, h('span', null, '$')));
  assert.deepEqual(layout(), ['$', 'INPUT', 'STEPPER']);
  await render(h(NumberField, { defaultValue: 1, hideStepper: true }, h('span', null, '$')));
  assert.deepEqual(layout(), ['$', 'INPUT']);
});

test('Input inside a Fragment splits adornments, and Stepper/Clear render unwrapped', async () => {
  await render(
    h(
      NumberField,
      { defaultValue: 1 },
      h(
        Fragment,
        null,
        h('span', null, 'Lead'),
        h(NumberField.Input),
        h('span', null, 'Trail'),
        h(NumberField.Clear),
        h(NumberField.Stepper),
      ),
    ),
  );
  assert.deepEqual(layout(), ['Lead', 'INPUT', 'Trail', 'BUTTON', 'STEPPER']);
  assert.equal(host.querySelector('[data-number-field-adornment] button'), null);
});

test('asChild merges Input and root props over the child and keeps the numeric model', async () => {
  let node;
  const events = [];
  await render(
    h(
      'form',
      null,
      h(
        NumberField,
        {
          name: 'amount',
          defaultValue: 2,
          ref: (value) => {
            node = value;
          },
          onValueChange: (value) => events.push(['root', value]),
        },
        h(
          NumberField.Input,
          { asChild: true, placeholder: 'input' },
          h('input', {
            name: 'child',
            placeholder: 'child',
            spellCheck: false,
            onChange: () => events.push('child'),
          }),
        ),
      ),
    ),
  );
  assert.equal(node, input());
  assert.equal(input().placeholder, 'input');
  assert.equal(input().getAttribute('spellcheck'), 'false');
  assert.equal(input().name, '');
  assert.ok('numberFieldInput' in input().dataset);
  await focus();
  await type('3');
  assert.deepEqual(events, ['child', ['root', 3]]);
  assert.equal(hidden().name, 'amount');
  assert.equal(hidden().value, '3');
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function pointer(target, type, pointerType = 'mouse') {
  await act(async () => {
    const event = new MouseEvent(type, { bubbles: true, cancelable: true, button: 0 });
    Object.defineProperty(event, 'pointerType', { value: pointerType });
    Object.defineProperty(event, 'pointerId', { value: 1 });
    target.dispatchEvent(event);
  });
}

test('Home and End jump to the bounds, Alt steps by smallStep, PageUp by largeStep', async () => {
  const form = controlled({ defaultValue: 5, min: 0, max: 10 });
  await render(form.node);
  await focus();
  assert.equal((await key('End')).defaultPrevented, true);
  assert.equal(form.value(), 10);
  await key('Home');
  assert.equal(form.value(), 0);
  await key('ArrowUp', { altKey: true });
  assert.equal(form.value(), 0.1);
  await key('PageUp');
  assert.equal(form.value(), 10.1 > 10 ? 10 : 10.1);
  await render(h(NumberField, { key: 'unbounded', defaultValue: 5 }));
  await focus();
  assert.equal((await key('Home')).defaultPrevented, false, 'without a bound the caret moves');
});

test('an explicit step snaps typed values on blur and arrows land on the grid', async () => {
  const half = controlled({ step: 0.5 });
  await render(half.node);
  await focus();
  await type('1.3');
  assert.equal(half.value(), 1.3, 'typing is not snapped while editing');
  await blur();
  assert.equal(half.value(), 1.5);
  await focus();
  await type('1.2');
  await key('ArrowUp');
  assert.equal(half.value(), 1.5, 'an off-grid value steps to the next grid value');
  await key('ArrowUp');
  assert.equal(half.value(), 2);
  await act(async () => root.unmount());
  root = undefined;

  const odd = controlled({ min: 1, max: 10, step: 2 });
  await render(odd.node);
  await focus();
  await type('4');
  await blur();
  assert.equal(odd.value(), 5, 'the grid is anchored at min: 1, 3, 5');
  await focus();
  await type('20');
  await blur();
  assert.equal(odd.value(), 9, 'clamping keeps the value on the grid');
  await act(async () => root.unmount());
  root = undefined;

  const free = controlled({});
  await render(free.node);
  await focus();
  await type('1.3');
  await blur();
  assert.equal(free.value(), 1.3, 'without an explicit step nothing is snapped');
});

test('a value set from outside is left alone when the field is focused and left', async () => {
  const form = controlled({ min: 0, max: 10, step: 1, defaultValue: 20 });
  await render(form.node);
  await focus();
  await blur();
  assert.equal(form.value(), 20);
  assert.deepEqual(form.changes, []);
  assert.equal(input().getAttribute('aria-invalid'), 'true');
  assert.equal(input().validity.customError, true);
  assert.equal(input().validationMessage, '값은 10 이하여야 합니다.');
  await focus();
  await type('3');
  assert.equal(input().validity.valid, true);
});

test('out-of-range values reach Field.Error through native validity', async () => {
  await render(
    h(
      'form',
      null,
      h(
        Field,
        null,
        h(Field.Label, null, 'Seats'),
        h(NumberField, { min: 1, defaultValue: 0, name: 'seats' }),
        h(Field.Error),
      ),
    ),
  );
  await act(async () => host.querySelector('form').checkValidity());
  assert.equal(
    host.querySelector('[data-field-part=error]').textContent,
    '값은 1 이상이어야 합니다.',
  );
  await focus();
  await key('ArrowUp');
  assert.equal(input().value, '1');
  assert.equal(
    host.querySelector('[data-field-part=error]'),
    null,
    'a step without an input event still clears the error',
  );
});

test('the wheel steps only when allowed and the input has focus', async () => {
  const form = controlled({ defaultValue: 1, allowWheelScrub: true });
  await render(form.node);
  const wheel = async (deltaY, init = {}) => {
    let event;
    await act(async () => {
      event = new WheelEvent('wheel', { deltaY, bubbles: true, cancelable: true, ...init });
      input().dispatchEvent(event);
    });
    return event;
  };
  assert.equal(
    (await wheel(-100)).defaultPrevented,
    false,
    'an unfocused field lets the page scroll',
  );
  assert.equal(form.value(), 1);
  await focus();
  assert.equal((await wheel(-100)).defaultPrevented, true);
  assert.equal(form.value(), 2);
  await wheel(100, { shiftKey: true });
  assert.equal(form.value(), -8);
  await wheel(-100, { ctrlKey: true });
  assert.equal(form.value(), -8, 'ctrl+wheel stays the browser zoom');
});

test('holding a stepper repeats and speeds up; releasing stops it', async () => {
  const form = controlled({ defaultValue: 0 });
  await render(form.node);
  const increment = button('값 늘리기');
  assert.equal(increment.tabIndex, -1);
  await pointer(increment, 'pointerdown');
  assert.equal(form.value(), 1, 'the press steps at once');
  assert.equal(document.activeElement, input(), 'a mouse press keeps focus in the input');
  for (let i = 0; i < 14; i++) await act(async () => wait(50));
  const held = form.value();
  assert.ok(held >= 4, `holding repeats (reached ${held})`);
  await pointer(increment, 'pointerup');
  await act(async () =>
    increment.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 })),
  );
  const released = form.value();
  assert.equal(released, held, 'the click after a press does not step again');
  for (let i = 0; i < 6; i++) await act(async () => wait(50));
  assert.equal(form.value(), released, 'releasing stops the repeat');
});

test('Increment and Decrement lay out beside the input; Escape clears with a Clear part', async () => {
  const form = controlled({
    defaultValue: 2,
    children: h(
      Fragment,
      null,
      h(NumberField.Decrement),
      h(NumberField.Input),
      h(NumberField.Clear),
      h(NumberField.Increment),
    ),
  });
  await render(form.node);
  assert.deepEqual(
    Array.from(shell().children, (el) => el.dataset.numberFieldStep ?? el.tagName),
    ['decrement', 'INPUT', 'BUTTON', 'increment'],
  );
  assert.equal(host.querySelectorAll('[data-number-field-stepper]').length, 0);
  await act(async () => button('값 줄이기').click());
  assert.equal(form.value(), 1);
  await focus();
  const escape = await key('Escape');
  assert.equal(escape.defaultPrevented, true);
  assert.equal(form.value(), null);
});

test('input hints: inputmode follows the range and grid, autocomplete is off', async () => {
  const hints = (props) =>
    new JSDOM(renderToString(h(NumberField, props))).window.document.querySelector('input');
  assert.equal(hints({}).getAttribute('inputmode'), 'decimal');
  assert.equal(hints({ min: 0, step: 1 }).getAttribute('inputmode'), 'numeric');
  assert.equal(hints({ inputMode: 'text' }).getAttribute('inputmode'), 'text');
  assert.equal(hints({}).getAttribute('autocomplete'), 'off');
  assert.equal(hints({ autoComplete: 'on' }).getAttribute('autocomplete'), 'on');
});

test('a tap on a stepper steps without focusing the input, and a cancelled press stops', async () => {
  const form = controlled({ defaultValue: 0 });
  await render(form.node);
  const increment = button('값 늘리기');
  await pointer(increment, 'pointerdown', 'touch');
  assert.equal(form.value(), 1);
  assert.notEqual(document.activeElement, input(), 'no on-screen keyboard for a tap');
  await pointer(increment, 'pointercancel', 'touch');
  for (let i = 0; i < 10; i++) await act(async () => wait(50));
  assert.equal(form.value(), 1, 'a cancelled press does not keep stepping');
});

test('on iOS a field that accepts negatives asks for the full keyboard', async () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0)',
      platform: 'iPhone',
      maxTouchPoints: 5,
    },
  });
  try {
    await render(h(NumberField, { 'aria-label': 'Delta' }));
    assert.equal(input().getAttribute('inputmode'), 'text');
    await render(h(NumberField, { key: 'positive', 'aria-label': 'Count', min: 0 }));
    assert.equal(input().getAttribute('inputmode'), 'decimal');
  } finally {
    if (original) Object.defineProperty(globalThis, 'navigator', original);
    else delete globalThis.navigator;
  }
});
