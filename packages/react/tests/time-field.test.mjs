import assert from 'node:assert/strict';
import { test, afterEach } from 'node:test';
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
});
for (const k of [
  'window',
  'document',
  'HTMLElement',
  'HTMLInputElement',
  'Event',
  'KeyboardEvent',
  'MouseEvent',
])
  globalThis[k] = dom.window[k];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement: h, act, StrictMode } = await import('react');
const { createRoot } = await import('react-dom/client');
const { TimeField } = await import('../dist/index.js');
let root, host;
afterEach(async () => {
  if (root) await act(async () => root.unmount());
  host?.remove();
  root = undefined;
});
async function render(el) {
  if (!root) {
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
  }
  await act(async () => root.render(el));
}
const click = (el) => act(async () => el.click());
const key = (el, k) =>
  act(async () =>
    el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })),
  );
const trigger = () => host.querySelector('[role=combobox]');
const column = (u) => host.querySelector(`[data-time-column="${u}"]`);
const option = (u, n) => column(u).querySelector(`[data-time-option="${n}"]`);
const d = (day = 15, hour = 9, minute = 30, second = 0) =>
  new Date(2026, 8, day, hour, minute, second);
test('TimeField StrictMode focus, successive unit changes, Escape and Clear', async () => {
  let value;
  await render(
    h(
      StrictMode,
      null,
      h(TimeField, {
        defaultValue: d(),
        format: 'HH:mm',
        hourCycle: '24h',
        onChange: (v) => (value = v),
      }),
    ),
  );
  await key(trigger(), 'ArrowDown');
  assert.equal(document.activeElement === column('hour'), true);
  await click(option('hour', 14));
  await click(option('minute', 45));
  assert.equal(value.getHours(), 14);
  assert.equal(value.getMinutes(), 45);
  assert.ok(host.querySelector('[role=dialog]'));
  await key(column('minute'), 'Escape');
  assert.equal(document.activeElement === trigger(), true);
  assert.match(trigger().textContent, /14:45/);
  await click(host.querySelector('[aria-label="시간 지우기"]'));
  assert.equal(value, null);
});
test('custom parts and content fallback, readonly and native callback cancellation', async () => {
  await render(
    h(
      TimeField,
      { defaultValue: d(), readOnly: true },
      h(TimeField.Trigger, { asChild: true }, h('button', null, h(TimeField.Value))),
      h(TimeField.Clear),
    ),
  );
  await click(trigger());
  assert.equal(host.querySelector('[role=dialog]'), null);
  assert.equal(host.querySelector('[aria-label="시간 지우기"]').disabled, true);
  await render(h(TimeField, { onClick: (e) => e.preventDefault() }));
  await click(trigger());
  assert.equal(host.querySelector('[role=dialog]'), null);
  await render(h(TimeField, null, h(TimeField.Content, null, 'Custom time controls')));
  await click(trigger());
  assert.equal(document.activeElement?.getAttribute('aria-label'), '시간 선택 닫기');
});
