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
test('SSR native input, Field label/ARIA, canonical FormData and missing sentinel diagnostics', () => {
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
  assert.throws(
    () => renderToString(h(TelField, null, h(TelField.Input), h(TelField.Input))),
    /Input/,
  );
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
