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
const { createElement: h, act, useState } = await import('react');
const { createRoot } = await import('react-dom/client');
const { renderToString } = await import('react-dom/server');
const { ButtonGroup, Toggle, ToggleGroup } = await import('../dist/index.js');

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
const click = (node = button()) => act(async () => node.click());

test('SSR: a quiet ghost toggle that exposes its pressed state', () => {
  const doc = new JSDOM(
    renderToString(
      h('div', null, h(Toggle, null, '굵게'), h(Toggle, { defaultPressed: true }, '기울임')),
    ),
  ).window.document;
  const [off, on] = doc.querySelectorAll('button');
  assert.equal(off.type, 'button');
  assert.equal(off.getAttribute('aria-pressed'), 'false');
  assert.equal(off.hasAttribute('data-pressed'), false);
  assert.equal(off.dataset.variant, 'ghost');
  assert.equal(on.getAttribute('aria-pressed'), 'true');
  assert.ok(on.hasAttribute('data-pressed'));
});

test('uncontrolled: a click flips the state and reports it', async () => {
  const changes = [];
  await render(h(Toggle, { onPressedChange: (next) => changes.push(next) }, '굵게'));
  await click();
  assert.equal(button().getAttribute('aria-pressed'), 'true');
  await click();
  assert.equal(button().getAttribute('aria-pressed'), 'false');
  assert.deepEqual(changes, [true, false]);
});

test('controlled: the state follows the prop', async () => {
  const changes = [];
  await render(
    h(Toggle, { pressed: false, onPressedChange: (next) => changes.push(next) }, '굵게'),
  );
  await click();
  assert.deepEqual(changes, [true]);
  assert.equal(button().getAttribute('aria-pressed'), 'false');

  function Controlled() {
    const [pressed, setPressed] = useState(true);
    return h(Toggle, { pressed, onPressedChange: setPressed }, '굵게');
  }
  await render(h(Controlled));
  await click();
  assert.equal(button().getAttribute('aria-pressed'), 'false');
});

test('onClick runs first and preventDefault keeps the state', async () => {
  const changes = [];
  await render(
    h(
      Toggle,
      { onClick: (event) => event.preventDefault(), onPressedChange: (next) => changes.push(next) },
      '굵게',
    ),
  );
  await click();
  assert.equal(button().getAttribute('aria-pressed'), 'false');
  assert.deepEqual(changes, []);
});

test('a disabled toggle does not change', async () => {
  const changes = [];
  await render(
    h(Toggle, { disabled: true, onPressedChange: (next) => changes.push(next) }, '굵게'),
  );
  await click();
  assert.deepEqual(changes, []);
  assert.equal(button().disabled, true);
});

test('size comes from the group unless the toggle sets it', async () => {
  await render(
    h(
      ButtonGroup,
      { size: 'tiny' },
      h(Toggle, { id: 'inherit' }, '가'),
      h(Toggle, { id: 'own', size: 'standard' }, '나'),
    ),
  );
  assert.equal(host.querySelector('#inherit').dataset.size, 'tiny');
  assert.equal(host.querySelector('#own').dataset.size, 'standard');
});

test('inside ToggleGroup a value is required and the group owns the state', () => {
  assert.throws(() => renderToString(h(ToggleGroup, null, h(Toggle, null, '가'))), /value/);
  assert.throws(
    () =>
      renderToString(h(ToggleGroup, null, h(Toggle, { value: 'a', defaultPressed: true }, '가'))),
    /owns the pressed state/,
  );
});
