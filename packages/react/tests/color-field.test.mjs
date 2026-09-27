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
const { ColorField, Field } = await import('../dist/index.js');
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
const trigger = () => host.querySelector('button');
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
test('SSR formats, alpha conversion, Field/ref ARIA and canonical FormData', () => {
  for (const [value, format, alpha, expected] of [
    ['#f00', 'hex', true, '#FF0000FF'],
    ['rgba(255, 0, 0, 0.5)', 'hex', true, '#FF000080'],
    ['hsl(120, 100%, 50%)', 'rgb', false, 'rgb(0, 255, 0)'],
    ['#0000ff', 'hsl', false, 'hsl(240, 100%, 50%)'],
  ]) {
    const doc = new JSDOM(
      renderToString(
        h(
          'form',
          null,
          h(
            Field,
            { required: true },
            h(Field.Label, null, 'Color'),
            h(ColorField, { name: 'color', defaultValue: value, format, alpha }),
          ),
        ),
      ),
    ).window.document;
    assert.equal(doc.querySelector('button').id, doc.querySelector('label').htmlFor);
    assert.equal(doc.querySelector('button').getAttribute('aria-required'), 'true');
    assert.equal(doc.querySelector('[type=hidden]').value, expected);
    assert.equal(new doc.defaultView.FormData(doc.querySelector('form')).get('color'), expected);
  }
});
test('swatches, keyboard area, alpha, typed invalid/valid colors, Escape and clear', async () => {
  let changes = [];
  await render(
    h(ColorField, {
      defaultValue: '#FF0000',
      alpha: true,
      swatches: ['#00FF00', '#0000FF'],
      onChange: (v) => changes.push(v),
    }),
  );
  await click(trigger());
  await click(host.querySelector('[aria-label="#00FF00"]'));
  assert.equal(changes.at(-1), '#00FF00FF');
  assert.ok(host.querySelector('[role=dialog]'));
  const area = host.querySelector('[role=slider]');
  await key(area, 'ArrowDown', { shiftKey: true });
  assert.equal(changes.at(-1), '#00E600FF');
  await type(host.querySelectorAll('[type=range]')[1], '50');
  assert.equal(changes.at(-1), '#00E60080');
  const before = changes.length;
  await type(editor(), 'nonsense');
  assert.equal(changes.length, before);
  assert.equal(editor().getAttribute('aria-invalid'), 'true');
  await type(editor(), 'rgb(0, 0, 255)');
  assert.equal(changes.at(-1), '#0000FFFF');
  await key(editor(), 'Escape');
  assert.equal(host.querySelector('[role=dialog]'), null);
  assert.equal(document.activeElement === trigger(), true);
  await click(host.querySelector('[aria-label="색상 지우기"]'));
  assert.equal(changes.at(-1), '');
  assert.equal(host.querySelector('[aria-label="색상 지우기"]'), null);
});
test('reset restores default, prevented reset and disabled/readonly block picker and clear', async () => {
  const view = (props) =>
    h('form', null, h(ColorField, { name: 'color', defaultValue: '#FF0000', ...props }));
  await render(view({}));
  await click(trigger());
  await type(editor(), '#0000FF');
  host.querySelector('form').addEventListener('reset', (e) => e.preventDefault(), { once: true });
  await act(async () => host.querySelector('form').reset());
  assert.equal(host.querySelector('[type=hidden]').value, '#0000FF');
  await act(async () => host.querySelector('form').reset());
  assert.equal(host.querySelector('[type=hidden]').value, '#FF0000');
  assert.equal(host.querySelector('[role=dialog]'), null);
  await render(view({ readOnly: true }));
  await click(trigger());
  assert.equal(host.querySelector('[role=dialog]'), null);
  assert.equal(host.querySelector('[aria-label="색상 지우기"]').disabled, true);
  await render(view({ disabled: true }));
  assert.equal(trigger().disabled, true);
  assert.deepEqual([...new window.FormData(host.querySelector('form'))], []);
});
test('RHF validation focuses trigger, selection, reset, external value and disabled omission', async () => {
  const { Field: F } = await import('../dist/react-hook-form.js');
  const { FormProvider, useForm } = await import('react-hook-form');
  let methods, result;
  function App({ disabled = false }) {
    methods = useForm({ defaultValues: { color: '' } });
    return h(
      FormProvider,
      methods,
      h(
        'form',
        { onSubmit: methods.handleSubmit((v) => (result = v)) },
        h(
          F,
          {
            name: 'color',
            controlMode: 'value',
            registerOptions: { required: 'Required' },
            disabled,
          },
          h(F.Label, null, 'Color'),
          h(ColorField, { swatches: ['#FF0000'] }),
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
  assert.equal(document.activeElement === trigger(), true);
  await click(trigger());
  await click(host.querySelector('[aria-label="#FF0000"]'));
  await key(editor(), 'Escape');
  await submit();
  assert.equal(result.color, '#FF0000');
  await act(async () => methods.reset());
  assert.equal(host.querySelector('[type=hidden]').value, '');
  await act(async () => methods.setValue('color', '#0000FF'));
  assert.ok(trigger().textContent.includes('#0000FF'));
  await render(h(App, { disabled: true }));
  await submit();
  assert.equal(result.color, undefined);
});

test('black keeps saturation so raising brightness restores chroma', async () => {
  await render(h(ColorField, { defaultValue: '#FF0000' }));
  await click(trigger());
  const area = host.querySelector('[role=slider]');
  for (let i = 0; i < 11; i++) await key(area, 'ArrowDown', { shiftKey: true });
  assert.equal(editor().value, '#000000');
  await key(area, 'ArrowUp', { shiftKey: true });
  assert.equal(editor().value, '#1A0000');
});
