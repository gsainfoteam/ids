import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
});
for (const name of ['window', 'document', 'HTMLElement', 'Event', 'KeyboardEvent', 'MouseEvent'])
  globalThis[name] = dom.window[name];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement: h, act } = await import('react');
const { createRoot } = await import('react-dom/client');
const { renderToString } = await import('react-dom/server');
const { BoldIcon, HeartIcon } = await import('@heroicons/react/24/outline');
const { IconToggle } = await import('../dist/index.js');

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
const button = () => host.querySelector('button');

test('SSR: named from the icon, pressed state exposed, ghost by default', () => {
  const doc = new JSDOM(renderToString(h(IconToggle, { icon: h(BoldIcon), defaultPressed: true })))
    .window.document;
  const toggle = doc.querySelector('button');
  assert.equal(toggle.getAttribute('aria-label'), 'Bold');
  assert.equal(toggle.getAttribute('aria-pressed'), 'true');
  assert.ok(toggle.hasAttribute('data-pressed'));
  assert.equal(toggle.dataset.variant, 'ghost');
});

test('an explicit name wins and stays put while the icon follows the state', async () => {
  const changes = [];
  await render(
    h(IconToggle, {
      'aria-label': '좋아요',
      icon: (state) =>
        h(state.pressed ? HeartIcon : BoldIcon, { 'data-on': String(state.pressed) }),
      onPressedChange: (next) => changes.push(next),
    }),
  );
  assert.equal(button().getAttribute('aria-label'), '좋아요');
  assert.equal(button().querySelector('svg').dataset.on, 'false');
  await act(async () => button().click());
  assert.deepEqual(changes, [true]);
  assert.equal(button().getAttribute('aria-pressed'), 'true');
  assert.equal(button().getAttribute('aria-label'), '좋아요');
  assert.equal(button().querySelector('svg').dataset.on, 'true');
});

test('children and a missing icon are rejected', () => {
  assert.throws(() => renderToString(h(IconToggle, { icon: h(BoldIcon) }, 'x')), /icon` prop, not/);
  assert.throws(() => renderToString(h(IconToggle, {})), /`icon` prop is required/);
});
