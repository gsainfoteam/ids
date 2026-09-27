import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
});
for (const key of [
  'window',
  'Element',
  'Node',
  'getComputedStyle',
  'document',
  'HTMLElement',
  'HTMLInputElement',
  'Event',
  'KeyboardEvent',
  'MouseEvent',
  'FocusEvent',
])
  globalThis[key] = dom.window[key];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement: h, act, useState } = await import('react');
const { createRoot } = await import('react-dom/client');
const { renderToString } = await import('react-dom/server');
const { ColorField, ColorPicker, Field } = await import('../dist/index.js');

let root, host;
afterEach(async () => {
  if (root) await act(() => root.unmount());
  root = undefined;
  host?.remove();
  delete window.matchMedia;
});
async function render(node) {
  if (!root) {
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
  }
  await act(() => root.render(node));
}
async function key(node, key, init = {}) {
  let event;
  await act(() => {
    event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
    node.dispatchEvent(event);
  });
  return event;
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
const trigger = () => host.querySelector('[data-color-field] button[aria-haspopup]');
const dialog = () => host.querySelector('[role=dialog]');
const editor = () => host.querySelector('[data-color-picker-input]');
const slider = (name) => host.querySelector(`input[type=range][aria-label="${name}"]`);
const swatch = (name) => host.querySelector(`[role=radio][aria-label="${name}"]`);
const clearButton = () => host.querySelector('[data-color-field-clear]');
function tracked(props = {}, ...children) {
  const changes = [];
  const opens = [];
  return {
    changes,
    opens,
    node: h(
      ColorField,
      {
        'aria-label': 'Color',
        ...props,
        onValueChange: (value) => changes.push(value),
        onOpenChange: (open) => opens.push(open),
      },
      ...children,
    ),
  };
}

test('SSR: the value is written in the field format, and the trigger reads label and value', () => {
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
    const button = doc.querySelector('button[aria-haspopup=dialog]');
    const label = doc.querySelector('label');
    const shown = doc.querySelector('[data-color-field] [id$=-value]');
    assert.equal(button.id, label.htmlFor);
    assert.equal(button.getAttribute('aria-labelledby'), `${label.id} ${shown.id}`);
    assert.equal(shown.textContent, expected);
    assert.equal(button.getAttribute('aria-required'), 'true');
    assert.equal(button.getAttribute('aria-expanded'), 'false');
    assert.equal(new doc.defaultView.FormData(doc.querySelector('form')).get('color'), expected);
  }
  const doc = new JSDOM(
    renderToString(
      h(ColorField, { 'aria-label': 'Brand', id: 'brand', size: 'tiny', variant: 'soft' }),
    ),
  ).window.document;
  const root = doc.querySelector('[data-color-field]');
  assert.equal(root.dataset.size, 'tiny');
  assert.equal(root.dataset.variant, 'soft');
  assert.equal(root.dataset.empty, '');
  assert.equal(
    doc.querySelector('button').getAttribute('aria-labelledby'),
    `brand ${doc.querySelector('[id$=-value]').id}`,
    'an aria-label is kept and the value is read after it',
  );
  assert.equal(doc.querySelector('[data-color-field-swatch]').dataset.empty, '');
  assert.equal(doc.querySelector('[id$=-value]').textContent, '색상 선택');
  assert.equal(doc.querySelector('[data-color-field-clear]'), null, 'nothing to clear');
});

test('click or ArrowDown opens a dialog on the first control; Escape closes it back to the trigger', async () => {
  const state = tracked({ defaultValue: '#3B82F6' });
  await render(state.node);
  await click(trigger());
  assert.equal(dialog().getAttribute('aria-label'), 'Color');
  assert.equal(trigger().getAttribute('aria-expanded'), 'true');
  assert.equal(trigger().getAttribute('aria-controls'), dialog().id);
  assert.equal(document.activeElement, slider('채도'), 'focus starts on the area');
  await key(slider('채도'), 'Escape');
  assert.equal(dialog(), null);
  assert.equal(document.activeElement, trigger());
  await key(trigger(), 'ArrowDown');
  assert.ok(dialog());
  assert.equal(document.activeElement, slider('채도'));
  await click(trigger());
  assert.equal(dialog(), null, 'the trigger toggles');
  assert.deepEqual(state.opens, [true, false, true, false]);
  assert.deepEqual(state.changes, []);
});

test('every change reaches onValueChange at once; a typed value waits for Enter', async () => {
  const state = tracked({
    defaultValue: '#FF0000',
    alpha: true,
    swatches: ['#00FF00', '#0000FF'],
  });
  await render(state.node);
  await click(trigger());
  await click(swatch('#00FF00'));
  assert.equal(state.changes.at(-1), '#00FF00FF');
  assert.ok(dialog(), 'choosing a swatch keeps the popup open');
  await key(slider('채도'), 'ArrowDown', { shiftKey: true });
  assert.equal(state.changes.at(-1), '#00E600FF');
  await type(slider('투명도'), '50');
  assert.equal(state.changes.at(-1), '#00E60080');
  assert.equal(trigger().textContent, '#00E60080');
  const before = state.changes.length;
  await type(editor(), 'rgb(0, 0, 255)');
  assert.equal(state.changes.length, before, 'a draft is not a value');
  await key(editor(), 'Enter');
  assert.equal(state.changes.at(-1), '#0000FFFF');
  assert.equal(editor().value, '#0000FFFF');
  await type(editor(), 'nonsense');
  assert.equal(editor().getAttribute('aria-invalid'), 'true');
  await key(editor(), 'Escape');
  assert.ok(dialog(), 'the first Escape only drops the draft');
  assert.equal(editor().value, '#0000FFFF');
  await key(editor(), 'Escape');
  assert.equal(dialog(), null);
  assert.equal(document.activeElement, trigger());
});

test('Clear empties the value and focuses the trigger; it is hidden while read-only', async () => {
  const state = tracked({ defaultValue: '#FF0000' });
  await render(state.node);
  assert.equal(clearButton().getAttribute('aria-label'), '색상 지우기');
  await click(clearButton());
  assert.deepEqual(state.changes, ['']);
  assert.equal(document.activeElement, trigger());
  assert.equal(clearButton(), null);
  assert.equal(trigger().dataset.placeholder, '');
  assert.equal(trigger().textContent, '색상 선택');
  await render(tracked({ defaultValue: '#FF0000', readOnly: true }).node);
  assert.equal(clearButton(), null);
});

test('an unreadable value is shown as it is and marks the field invalid', async () => {
  await render(h(ColorField, { 'aria-label': 'Color', defaultValue: 'nonsense' }));
  assert.equal(trigger().textContent, 'nonsense');
  assert.equal(trigger().getAttribute('aria-invalid'), 'true');
  assert.equal(host.querySelector('[data-color-field]').dataset.invalid, '');
  assert.equal(host.querySelector('[data-color-field-swatch]').dataset.empty, '');
  await render(
    h(ColorField, { key: 'b', 'aria-label': 'Color', defaultValue: '#FF0000', invalid: true }),
  );
  assert.equal(trigger().getAttribute('aria-invalid'), 'true');
  await render(
    h(ColorField, {
      key: 'c',
      'aria-label': 'Color',
      defaultValue: 'nonsense',
      'aria-invalid': false,
    }),
  );
  assert.equal(trigger().getAttribute('aria-invalid'), 'false', 'an explicit aria-invalid wins');
});

test('an outside value is shown in the field format without calling onValueChange', async () => {
  const state = tracked({ value: '#3b82f6', format: 'rgb' });
  await render(state.node);
  assert.equal(trigger().textContent, 'rgb(59, 130, 246)');
  await click(trigger());
  assert.equal(editor().value, 'rgb(59, 130, 246)');
  assert.deepEqual(state.changes, []);
});

test('required is enforced natively, empty is not submitted, reset restores the default', async () => {
  await render(
    h(
      'form',
      null,
      h(ColorField, {
        'aria-label': 'Color',
        name: 'color',
        required: true,
        swatches: ['#00FF00'],
      }),
    ),
  );
  const form = host.querySelector('form');
  const validator = host.querySelector('[data-form-value-validator]');
  assert.deepEqual([...new window.FormData(form)], [], 'an empty value is not submitted');
  assert.equal(form.checkValidity(), false);
  assert.equal(validator.validity.valueMissing, true);
  await act(() => validator.focus());
  assert.equal(document.activeElement, trigger(), 'focus moves on to the trigger');
  await click(trigger());
  await click(swatch('#00FF00'));
  assert.equal(form.checkValidity(), true);
  assert.deepEqual([...new window.FormData(form)], [['color', '#00FF00']]);
  form.addEventListener('reset', (event) => event.preventDefault(), { once: true });
  await act(async () => form.reset());
  assert.deepEqual([...new window.FormData(form)], [['color', '#00FF00']], 'a prevented reset');
  await act(async () => form.reset());
  assert.deepEqual([...new window.FormData(form)], []);
  assert.equal(dialog(), null, 'reset closes the popup');
});

test('disabled is not submitted and never opens; read-only is submitted, not validated or opened', async () => {
  const view = (props) =>
    h(
      'form',
      { key: JSON.stringify(props) },
      h(ColorField, {
        'aria-label': 'Color',
        name: 'color',
        required: true,
        defaultValue: '#FF0000',
        defaultOpen: true,
        ...props,
      }),
    );
  await render(view({ disabled: true }));
  assert.equal(trigger().disabled, true);
  assert.equal(dialog(), null);
  assert.deepEqual([...new window.FormData(host.querySelector('form'))], []);
  await render(view({ readOnly: true, defaultValue: '' }));
  assert.equal(dialog(), null);
  await click(trigger());
  await key(trigger(), 'ArrowDown');
  assert.equal(dialog(), null);
  assert.equal(trigger().getAttribute('aria-disabled'), 'true');
  assert.equal(host.querySelector('form').checkValidity(), true, 'read-only is not validated');
  await render(view({ readOnly: true }));
  assert.deepEqual([...new window.FormData(host.querySelector('form'))], [['color', '#FF0000']]);
});

test('open, defaultOpen and onOpenChange; outside press and focus leaving close a popover', async () => {
  function Controlled() {
    const [open, setOpen] = useState(true);
    return h(
      'div',
      null,
      h('button', { id: 'outside', onClick: () => setOpen(true) }, 'Open'),
      h(ColorField, { 'aria-label': 'Color', open, onOpenChange: setOpen }),
    );
  }
  await render(h(Controlled));
  assert.ok(dialog(), 'starts open');
  await act(() =>
    host.querySelector('#outside').dispatchEvent(new MouseEvent('pointerdown', { bubbles: true })),
  );
  assert.equal(dialog(), null);
  await click(host.querySelector('#outside'));
  assert.ok(dialog());
  await act(() => host.querySelector('#outside').focus());
  assert.equal(dialog(), null, 'focus leaving the popover closes it');
});

test('onBlur waits until focus leaves both the trigger and the popup', async () => {
  let blurs = 0;
  await render(
    h(
      'div',
      null,
      h(
        Field,
        null,
        h(Field.Label, null, 'Brand'),
        h(ColorField, { defaultValue: '#FF0000', onBlur: () => blurs++ }),
      ),
      h('button', { id: 'after' }, 'After'),
    ),
  );
  await act(() => trigger().focus());
  await click(trigger());
  assert.equal(document.activeElement, slider('채도'));
  assert.equal(dialog().getAttribute('aria-labelledby'), host.querySelector('label').id);
  assert.equal(blurs, 0, 'moving into the popup is not a blur');
  await act(() => editor().focus());
  assert.equal(blurs, 0);
  await act(() => host.querySelector('#after').focus());
  assert.equal(blurs, 1);
});

test('Content holds ColorPicker parts, and focus goes to the first one given', async () => {
  const state = tracked(
    { defaultValue: '#0000FF', swatches: ['#FF0000', '#0000FF'] },
    h(ColorField.Content, null, h(ColorPicker.Swatches)),
  );
  await render(state.node);
  await click(trigger());
  assert.equal(host.querySelector('[data-color-picker-area]'), null);
  assert.equal(editor(), null);
  assert.equal(document.activeElement, swatch('#0000FF'), 'the chosen swatch takes focus');
  await key(swatch('#0000FF'), 'ArrowRight');
  assert.deepEqual(state.changes, ['#FF0000'], 'arrows wrap to the next color');
  await render(
    tracked(
      { key: 'hue', defaultValue: '#FF0000', alpha: true },
      h(ColorField.Content, null, h(ColorPicker.HueSlider), h(ColorPicker.Input)),
    ).node,
  );
  await key(trigger(), 'ArrowDown');
  assert.equal(host.querySelector('[data-color-picker-alpha]'), null);
  assert.equal(document.activeElement, slider('색조'));
  assert.ok(editor());
});

test('parts: a custom trigger, and Clear must sit beside the trigger', async () => {
  await render(
    h(
      ColorField,
      { 'aria-label': 'Color', defaultValue: '#00FF00' },
      h(ColorField.Trigger, { className: 'custom' }, h(ColorField.Value)),
    ),
  );
  assert.ok(trigger().classList.contains('custom'));
  assert.equal(host.querySelector('[data-color-field-swatch]'), null);
  assert.equal(trigger().textContent, '#00FF00');
  assert.ok(clearButton(), 'Clear is still added beside it');
  assert.throws(
    () =>
      renderToString(
        h(
          ColorField,
          { 'aria-label': 'Color', defaultValue: '#00FF00' },
          h(ColorField.Trigger, null, h(ColorField.Value), h(ColorField.Clear)),
        ),
      ),
    /sibling of Trigger/,
  );
  assert.throws(
    () =>
      renderToString(
        h(ColorField, { 'aria-label': 'Color' }, h(ColorField.Content), h(ColorField.Content)),
      ),
    /one Trigger, Content and Clear/,
  );
});

test('drawer on a small screen: modal dialog with a title and a close button', async () => {
  window.matchMedia = () => ({
    matches: true,
    addEventListener() {},
    removeEventListener() {},
  });
  const state = tracked({ defaultValue: '#FF0000', mobileVariant: 'drawer' });
  await render(state.node);
  await click(trigger());
  const popup = dialog();
  assert.equal(popup.dataset.presentation, 'drawer');
  assert.equal(popup.getAttribute('aria-modal'), 'true');
  assert.ok(popup.textContent.includes('색상 선택'));
  assert.equal(document.activeElement, slider('채도'));
  const close = popup.querySelector('button[aria-label="닫기"]');
  assert.ok(close);
  await click(close);
  assert.equal(dialog(), null);
  assert.equal(document.activeElement, trigger());
  delete window.matchMedia;
  await render(tracked({ defaultValue: '#FF0000', mobileVariant: 'drawer', key: 'wide' }).node);
  await click(trigger());
  assert.equal(dialog().dataset.presentation, 'popover');
  assert.equal(dialog().querySelector('button[aria-label="닫기"]'), null, 'no header in a popover');
});

test('react-hook-form value mode: validation focuses the trigger, selection, reset and outside values', async () => {
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
  assert.equal(document.activeElement, trigger());
  assert.equal(host.querySelector('[data-field-part=error]').textContent, 'Required');
  await click(trigger());
  await click(swatch('#FF0000'));
  assert.equal(methods.getValues('color'), '#FF0000');
  await key(swatch('#FF0000'), 'Escape');
  await submit();
  assert.deepEqual(result, { color: '#FF0000' });
  await act(async () => methods.reset());
  assert.equal(trigger().textContent, '색상 선택');
  await act(async () => methods.setValue('color', '#0000FF'));
  assert.equal(trigger().textContent, '#0000FF');
  await render(h(App, { disabled: true }));
  await submit();
  assert.equal(result.color, undefined);
});
