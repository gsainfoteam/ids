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
  'FocusEvent',
])
  globalThis[key] = dom.window[key];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement: h, act, useState } = await import('react');
const { createRoot } = await import('react-dom/client');
const { renderToString } = await import('react-dom/server');
const { ColorPicker } = await import('../dist/index.js');

let root, host;
afterEach(async () => {
  if (root) await act(() => root.unmount());
  root = undefined;
  host?.remove();
  delete dom.window.EyeDropper;
  delete navigator.clipboard;
});
async function render(node) {
  if (!root) {
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
  }
  await act(async () => root.render(node));
}
async function key(node, key, init = {}) {
  let event;
  await act(async () => {
    event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
    node.dispatchEvent(event);
  });
  return event;
}
async function type(node, value) {
  await act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(node, value);
    node.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
const slider = (name) => host.querySelector(`input[type=range][aria-label="${name}"]`);
const textInput = () => host.querySelector('[data-color-picker-input]');
function tracked(props = {}) {
  const changes = [];
  return {
    changes,
    node: h(ColorPicker, { ...props, onValueChange: (value) => changes.push(value) }),
  };
}

test('SSR: one group with an area of two sliders, a hue slider, a text input and a palette', () => {
  const doc = new JSDOM(
    renderToString(
      h(ColorPicker, { defaultValue: '#3B82F6', swatches: ['#3B82F6', 'nonsense', '#22C55E'] }),
    ),
  ).window.document;
  const group = doc.querySelector('[data-color-picker]');
  assert.equal(group.getAttribute('role'), 'group');
  assert.equal(group.getAttribute('aria-label'), '색상 선택');
  const [saturation, brightness] = doc.querySelectorAll('[data-color-picker-area] input');
  assert.equal(saturation.getAttribute('aria-label'), '채도');
  assert.equal(saturation.getAttribute('aria-roledescription'), '2D 슬라이더');
  assert.equal(saturation.getAttribute('aria-valuetext'), '채도 76%, 밝기 96%');
  assert.equal(brightness.getAttribute('aria-orientation'), 'vertical');
  assert.equal(brightness.getAttribute('aria-valuetext'), '채도 76%, 밝기 96%');
  assert.equal(doc.querySelector('[data-color-picker-area]').getAttribute('dir'), 'ltr');
  assert.equal(doc.querySelector('[data-color-picker-hue]').getAttribute('dir'), 'ltr');
  assert.equal(brightness.getAttribute('tabindex'), '-1');
  assert.equal(doc.querySelector('[aria-label="색조"]').getAttribute('aria-valuetext'), '217도');
  assert.equal(doc.querySelector('[aria-label="투명도"]'), null, 'no alpha slider without alpha');
  assert.equal(doc.querySelector('[data-color-picker-input]').value, '#3B82F6');
  const radios = doc.querySelectorAll('[role=radiogroup] [role=radio]');
  assert.equal(radios.length, 2, 'an unreadable swatch is skipped');
  assert.equal(radios[0].getAttribute('aria-checked'), 'true');
  assert.equal(radios[0].getAttribute('tabindex'), '0');
  assert.equal(radios[1].getAttribute('tabindex'), '-1');
  assert.equal(doc.querySelector('[data-color-picker-eyedropper]'), null);
  assert.equal(doc.querySelector('[data-color-picker-copy]'), null);
});

test('the area takes arrows for both axes, Shift for bigger steps, Home and End', async () => {
  const state = tracked({ defaultValue: '#FF0000' });
  await render(state.node);
  const area = slider('채도');
  const down = await key(area, 'ArrowDown', { shiftKey: true });
  assert.equal(down.defaultPrevented, true);
  assert.deepEqual(state.changes, ['#E60000']);
  await key(area, 'ArrowLeft');
  assert.equal(area.getAttribute('aria-valuetext'), '채도 99%, 밝기 90%');
  await key(area, 'Home');
  assert.equal(state.changes.at(-1), '#E6E6E6');
  await key(slider('밝기'), 'PageDown');
  assert.equal(state.changes.at(-1), '#CCCCCC', 'PageDown works from the vertical input too');
});

test('black and grays keep the hue and saturation the user dragged through', async () => {
  const state = tracked({ defaultValue: '#0000FF' });
  await render(state.node);
  const area = slider('채도');
  for (let i = 0; i < 11; i++) await key(area, 'ArrowDown', { shiftKey: true });
  assert.equal(state.changes.at(-1), '#000000');
  await key(area, 'ArrowUp', { shiftKey: true });
  assert.equal(state.changes.at(-1), '#00001A', 'blue comes back, not red');
});

test('sliders: hue and alpha by key and by the input value that assistive technology sets', async () => {
  const state = tracked({ defaultValue: '#FF000080', alpha: true, format: 'rgb' });
  await render(state.node);
  const hue = slider('색조');
  await key(hue, 'PageUp');
  assert.equal(hue.getAttribute('aria-valuetext'), '10도');
  await key(hue, 'End');
  assert.equal(hue.getAttribute('aria-valuetext'), '360도');
  await type(hue, '120');
  assert.equal(state.changes.at(-1), 'rgba(0, 255, 0, 0.502)');
  const alpha = slider('투명도');
  await key(alpha, 'Home');
  assert.equal(state.changes.at(-1), 'rgba(0, 255, 0, 0)');
  assert.equal(alpha.getAttribute('aria-valuetext'), '0%');
});

test('pressing on the area sets both axes from the pointer and focuses the area', async () => {
  const state = tracked({ defaultValue: '#FF0000' });
  await render(state.node);
  const area = host.querySelector('[data-color-picker-area]');
  area.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 100 });
  await act(async () =>
    area.dispatchEvent(
      new MouseEvent('pointerdown', { bubbles: true, cancelable: true, clientX: 50, clientY: 25 }),
    ),
  );
  assert.equal(state.changes.at(-1), '#BF8F8F', 'saturation 25%, brightness 75%');
  assert.equal(document.activeElement, slider('채도'));
  area.hasPointerCapture = () => true;
  await act(async () =>
    area.dispatchEvent(new MouseEvent('pointermove', { bubbles: true, clientX: 200, clientY: 0 })),
  );
  assert.equal(state.changes.at(-1), '#FF0000', 'a captured drag keeps updating');
});

test('typed text is a draft until Enter or blur; unreadable text is reverted', async () => {
  const state = tracked({ defaultValue: '#3B82F6' });
  await render(state.node);
  const input = textInput();
  await type(input, '#12');
  assert.deepEqual(state.changes, [], 'nothing is committed while typing');
  await type(input, '22c55e');
  const enter = await key(input, 'Enter');
  assert.equal(enter.defaultPrevented, true);
  assert.deepEqual(state.changes, ['#22C55E'], 'hex without # is read');
  assert.equal(input.value, '#22C55E');
  await type(input, 'nope');
  assert.equal(input.getAttribute('aria-invalid'), 'true');
  await key(input, 'Enter');
  assert.equal(input.value, 'nope', 'Enter keeps an unreadable draft so it can be fixed');
  const escape = await key(input, 'Escape');
  assert.equal(escape.defaultPrevented, true, 'the first Escape only drops the draft');
  assert.equal(input.value, '#22C55E');
  const idle = await key(input, 'Escape');
  assert.equal(idle.defaultPrevented, false, 'with no draft Escape is left to the popup');
  await type(input, 'rgb(255, 0, 0)');
  await act(async () => input.dispatchEvent(new FocusEvent('focusout', { bubbles: true })));
  assert.equal(state.changes.at(-1), '#FF0000', 'blur commits a readable draft');
  await type(input, 'still nope');
  await act(async () => input.dispatchEvent(new FocusEvent('focusout', { bubbles: true })));
  assert.equal(input.value, '#FF0000', 'blur drops an unreadable draft');
  await type(input, '');
  await key(input, 'Enter');
  assert.equal(state.changes.at(-1), '', 'an emptied field clears the value');
});

test('swatches are one radio group: arrows choose the next color and wrap', async () => {
  const state = tracked({
    defaultValue: '#22C55E',
    swatches: ['#EF4444', { value: '#22C55E', label: 'Green' }, '#3B82F6'],
  });
  await render(state.node);
  const radios = () => [...host.querySelectorAll('[role=radio]')];
  assert.equal(radios()[1].getAttribute('aria-label'), 'Green');
  assert.equal(radios()[1].tabIndex, 0);
  await act(async () => radios()[1].focus());
  await key(radios()[1], 'ArrowRight');
  assert.equal(state.changes.at(-1), '#3B82F6');
  assert.equal(document.activeElement, radios()[2]);
  await key(radios()[2], 'ArrowRight');
  assert.equal(state.changes.at(-1), '#EF4444', 'wraps to the first');
  await key(radios()[0], 'End');
  assert.equal(state.changes.at(-1), '#3B82F6');
});

test('eyedropper: shown only where the API exists; a cancelled pick changes nothing', async () => {
  let next = { sRGBHex: '#123456' };
  dom.window.EyeDropper = class {
    open() {
      return next instanceof Error ? Promise.reject(next) : Promise.resolve(next);
    }
  };
  const state = tracked({ defaultValue: '#FFFFFF80', alpha: true });
  await render(state.node);
  const button = host.querySelector('[data-color-picker-eyedropper]');
  assert.equal(button.getAttribute('aria-label'), '화면에서 색 고르기');
  await act(async () => button.click());
  assert.equal(state.changes.at(-1), '#12345680', 'the picked color keeps the alpha');
  next = new Error('AbortError');
  await act(async () => button.click());
  assert.equal(state.changes.length, 1);
});

test('copy writes the shown value and announces it', async () => {
  const written = [];
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: async (text) => void written.push(text) },
  });
  await render(tracked({ defaultValue: '#3B82F6', format: 'hsl' }).node);
  const button = host.querySelector('[data-color-picker-copy]');
  await act(async () => button.click());
  assert.deepEqual(written, ['hsl(217, 91%, 60%)']);
  assert.equal(host.querySelector('[role=status]').textContent, '복사했습니다');
  assert.equal(button.getAttribute('aria-label'), '복사했습니다');
});

test('controlled, read-only and disabled', async () => {
  let set;
  const changes = [];
  function App() {
    const [value, setValue] = useState('#808080');
    set = setValue;
    return h(ColorPicker, {
      value,
      onValueChange: (next) => {
        changes.push(next);
        setValue(next);
      },
    });
  }
  await render(h(App));
  await act(async () => set('#00FF00'));
  assert.equal(textInput().value, '#00FF00');
  assert.deepEqual(changes, [], 'an outside change is not echoed');
  await render(tracked({ defaultValue: '#FF0000', readOnly: true }).node);
  await key(slider('채도'), 'ArrowLeft');
  assert.equal(textInput().readOnly, true);
  assert.equal(slider('채도').getAttribute('aria-valuetext'), '채도 100%, 밝기 100%');
  await render(
    h('div', { key: 'disabled' }, tracked({ defaultValue: '#FF0000', disabled: true }).node),
  );
  assert.equal(slider('채도').disabled, true);
  assert.ok(host.querySelector('[data-color-picker]').hasAttribute('data-disabled'));
});

test('composition renders only the parts it is given', async () => {
  await render(
    h(
      ColorPicker,
      { defaultValue: '#22C55E', swatches: ['#22C55E'] },
      h(ColorPicker.HueSlider),
      h(ColorPicker.Input),
    ),
  );
  assert.equal(host.querySelector('[data-color-picker-area]'), null);
  assert.equal(host.querySelector('[role=radiogroup]'), null);
  assert.ok(slider('색조'));
  assert.ok(textInput());
});

test('with no value the controls start on a full red and the value stays empty', () => {
  const doc = new JSDOM(renderToString(h(ColorPicker))).window.document;
  assert.equal(
    doc.querySelector('[data-color-picker-area] input').getAttribute('aria-valuetext'),
    '채도 100%, 밝기 100%',
  );
  assert.equal(doc.querySelector('[aria-label="색조"]').getAttribute('aria-valuetext'), '0도');
  assert.equal(doc.querySelector('[data-color-picker-input]').value, '');
  assert.ok(doc.querySelector('[data-color-picker]').hasAttribute('data-empty'));
});
