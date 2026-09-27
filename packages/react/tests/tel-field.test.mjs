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
const { createElement: h, act, Fragment } = await import('react');
const { createRoot } = await import('react-dom/client');
const { renderToString } = await import('react-dom/server');
const { TelField, Field } = await import('../dist/index.js');
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
const input = () => host.querySelector('[type=tel]');
test('SSR native input, Field label/ARIA and canonical FormData', () => {
  const doc = new JSDOM(
    renderToString(
      h(
        'form',
        null,
        h(
          Field,
          { invalid: true, required: true },
          h(Field.Label, null, 'Phone'),
          h(TelField, {
            name: 'phone',
            defaultCountry: 'KR',
            format: 'international',
            defaultValue: '01012345678',
          }),
        ),
      ),
    ),
  ).window.document;
  const node = doc.querySelector('[type=tel]');
  assert.equal(node.id, doc.querySelector('label').htmlFor);
  assert.equal(node.autocomplete, 'tel');
  assert.equal(node.inputMode, 'tel');
  assert.equal(node.getAttribute('aria-invalid'), 'true');
  assert.deepEqual(
    [...new doc.defaultView.FormData(doc.querySelector('form'))],
    [['phone', '+821012345678']],
  );
});
test('invalid structures fail clearly', () => {
  for (const [node, message] of [
    [h(TelField, null, h(TelField.Input), h(TelField.Input)), /at most one `<TelField.Input/],
    [
      h(TelField, null, h(TelField.CountrySelect), h(TelField.CountrySelect)),
      /at most one `<TelField.CountrySelect/,
    ],
    [h(TelField.Input), /must be used inside `<TelField>`/],
    [h(TelField, null, h(TelField.Input, { asChild: true }, h('textarea'))), /asChild>` requires/],
    [h(TelField, null, h(TelField.Input, null, 'text')), /takes no children/],
  ])
    assert.throws(() => renderToString(node), message);
});
test('Input values win over root values, but root and Input handlers both run', async () => {
  const events = [];
  let last;
  await render(
    h(
      TelField,
      {
        id: 'root-id',
        placeholder: 'root',
        onBlur: () => events.push('root'),
        onChange: (v) => (last = v),
      },
      h(TelField.Input, {
        placeholder: 'input',
        onBlur: () => events.push('input'),
        onChange: () => events.push('input-change'),
      }),
    ),
  );
  assert.equal(input().id, 'root-id');
  assert.equal(input().placeholder, 'input');
  assert.ok('telFieldInput' in input().dataset);
  await type(input(), '01012345678');
  assert.deepEqual(events, ['input-change']);
  assert.equal(input().value, '010-1234-5678');
  assert.equal(last, '010-1234-5678');
  await act(() => input().dispatchEvent(new window.FocusEvent('focusout', { bubbles: true })));
  assert.deepEqual(events, ['input-change', 'root', 'input']);
});
test('children without an Input become leading adornments before an auto-inserted Input', async () => {
  await render(
    h(TelField, { 'aria-label': 'Phone' }, h(TelField.CountrySelect), h('span', null, 'Tel')),
  );
  const shell = host.querySelector('[data-tel-field]');
  assert.deepEqual(
    Array.from(shell.children, (el) =>
      'telFieldAdornment' in el.dataset ? el.textContent : el.tagName,
    ),
    ['DIV', 'Tel', 'INPUT'],
  );
  assert.ok(shell.firstElementChild.matches('[data-select]'));
  assert.equal(input().getAttribute('aria-label'), 'Phone');
  await type(input(), '01012345678');
  assert.equal(input().value, '010-1234-5678');
});
test('sentinel inside a Fragment splits leading and trailing adornments', async () => {
  await render(
    h(
      TelField,
      null,
      h(Fragment, null, h('span', null, 'Lead'), h(TelField.Input), h('span', null, 'Trail')),
    ),
  );
  assert.deepEqual(
    Array.from(host.querySelector('[data-tel-field]').children, (el) =>
      'telFieldAdornment' in el.dataset ? el.textContent : el.tagName,
    ),
    ['Lead', 'INPUT', 'Trail'],
  );
});
test('asChild merges props and ref into the child input and keeps formatting', async () => {
  let node;
  const changes = [];
  await render(
    h(
      TelField,
      {
        name: 'tel',
        onBlur: () => changes.push('root'),
        ref: (value) => {
          node = value;
        },
      },
      h(
        TelField.Input,
        { asChild: true },
        h('input', {
          spellCheck: false,
          onChange: () => changes.push('child'),
          onBlur: () => changes.push('child-blur'),
        }),
      ),
    ),
  );
  assert.equal(node, input());
  assert.equal(input().getAttribute('spellcheck'), 'false');
  assert.ok('telFieldInput' in input().dataset);
  await type(input(), '01012345678');
  assert.equal(input().value, '010-1234-5678');
  await act(() => input().dispatchEvent(new window.FocusEvent('focusout', { bubbles: true })));
  assert.deepEqual(changes, ['child', 'child-blur', 'root']);
});
test('progressive formatting, separator deletion, caret, raw mode and IME', async () => {
  let changes = [];
  await render(h(TelField, { onChange: (v) => changes.push(v) }));
  await type(input(), '01012345678');
  assert.equal(input().value, '010-1234-5678');
  assert.equal(changes.at(-1), '010-1234-5678');
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(
      input(),
      '0101234-5678',
    );
    input().setSelectionRange(3, 3);
    input().dispatchEvent(new Event('input', { bubbles: true }));
  });
  assert.notEqual(input().value, '010-1234-5678');
  assert.ok(input().selectionStart < input().value.length);
  await render(h(TelField, { format: 'none', onChange: (v) => changes.push(v) }));
  await type(input(), 'call me 123');
  assert.equal(input().value, 'call me 123');
  await type(input(), 'call m 123');
  assert.equal(input().value, 'call m 123');
  await render(h(TelField, { onChange: (v) => changes.push(v) }));
  await act(() =>
    input().dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true })),
  );
  const before = changes.length;
  await type(input(), '０１０１２３４５６７８');
  assert.equal(changes.length, before);
  await act(() => input().dispatchEvent(new CompositionEvent('compositionend', { bubbles: true })));
  assert.equal(changes.at(-1), '010-1234-5678');
});
test('CountrySelect emits international values, searches country, disables and resets', async () => {
  let last;
  const view = (disabled = false) =>
    h(
      'form',
      null,
      h(
        TelField,
        { name: 'tel', defaultCountry: 'KR', disabled, onChange: (v) => (last = v) },
        h(TelField.CountrySelect),
        h(TelField.Input),
      ),
    );
  await render(view());
  await type(input(), '01012345678');
  assert.equal(last, '+821012345678');
  await act(() => host.querySelector('button').click());
  await type(host.querySelector('[role=combobox][type=text]'), 'US');
  await act(() => host.querySelector('[role=option]').click());
  assert.equal(last, '+11012345678');
  assert.ok(host.querySelector('button').textContent.includes('US +1'));
  await act(async () => host.querySelector('form').reset());
  assert.equal(input().value, '');
  assert.ok(host.querySelector('button').textContent.includes('KR +82'));
  await render(view(true));
  assert.equal(input().disabled, true);
  assert.equal(host.querySelector('button').disabled, true);
});
test('RHF controlled value, validation/focus, setValue/reset and disabled omission', async () => {
  const { Field: F } = await import('../dist/react-hook-form.js');
  const { FormProvider, useForm } = await import('react-hook-form');
  let methods, result;
  function App({ disabled = false }) {
    methods = useForm({ defaultValues: { phone: '' } });
    return h(
      FormProvider,
      methods,
      h(
        'form',
        { onSubmit: methods.handleSubmit((v) => (result = v)) },
        h(
          F,
          {
            name: 'phone',
            controlMode: 'value',
            registerOptions: { required: 'Required' },
            disabled,
          },
          h(F.Label, null, 'Phone'),
          h(TelField, { format: 'international' }),
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
  assert.equal(document.activeElement === input(), true);
  await type(input(), '01012345678');
  await submit();
  assert.equal(result.phone, '+821012345678');
  await act(async () => methods.setValue('phone', '+12025550123'));
  assert.equal(input().value, '+1 202 555 0123');
  await act(async () => methods.reset());
  assert.equal(input().value, '');
  await render(h(App, { disabled: true }));
  await submit();
  assert.equal(result.phone, undefined);
});
