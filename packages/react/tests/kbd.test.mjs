import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost' });
for (const name of ['window', 'document', 'HTMLElement']) globalThis[name] = dom.window[name];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement: h, act } = await import('react');
const { createRoot, hydrateRoot } = await import('react-dom/client');
const { renderToString } = await import('react-dom/server');
const { Kbd, Field } = await import('../dist/index.js');

function overrideHostPlatform(platform) {
  Object.defineProperty(globalThis, 'navigator', {
    value: { platform, userAgent: '' },
    configurable: true,
  });
}

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

const doc = (node) => new JSDOM(renderToString(node)).window.document;
const visible = (element) => {
  const copy = element.cloneNode(true);
  copy.querySelectorAll('.sr-only').forEach((node) => node.remove());
  return copy.textContent;
};
const spoken = (element) => {
  const parts = [];
  const walk = (node) => {
    if (node.nodeType === 3) {
      const text = node.textContent.trim();
      if (text) parts.push(text);
    } else if (node.getAttribute?.('aria-hidden') !== 'true') node.childNodes.forEach(walk);
  };
  walk(element);
  return parts.join(' ');
};

test('mod is ⌘ on Apple and Ctrl elsewhere, with platform order and joiners', () => {
  const apple = doc(h(Kbd, { keys: 'k+shift+mod', platform: 'apple' })).querySelector(
    '[data-kbd-group]',
  );
  assert.equal(visible(apple), '⇧⌘K');
  assert.equal(spoken(apple), '시프트 커맨드 K');
  assert.equal(apple.querySelectorAll('kbd[data-kbd]').length, 3);
  assert.equal(apple.querySelector('[data-kbd-separator]'), null);

  const other = doc(h(Kbd, { keys: 'k+shift+mod', platform: 'other' })).querySelector(
    '[data-kbd-group]',
  );
  assert.equal(visible(other), 'Ctrl+Shift+K');
  assert.equal(spoken(other), '컨트롤 + 시프트 + K');
  assert.equal(other.dataset.platform, 'other');
});

test('the server renders the portable form, the client switches to ⌘ on Apple', async () => {
  const markup = renderToString(h(Kbd, { keys: 'mod+k' }));
  assert.match(markup, /Ctrl/);
  overrideHostPlatform('MacIntel');
  host = document.createElement('div');
  host.innerHTML = markup;
  document.body.append(host);
  const errors = [];
  await act(async () => {
    root = hydrateRoot(host, h(Kbd, { keys: 'mod+k' }), {
      onRecoverableError: (error) => errors.push(error),
    });
  });
  assert.deepEqual(errors, []);
  assert.equal(visible(host.querySelector('[data-kbd-group]')), '⌘K');
});

test('client rendering detects the platform', async () => {
  overrideHostPlatform('Win32');
  await render(h(Kbd, { keys: 'mod' }));
  assert.equal(visible(host.querySelector('[data-kbd]')), 'Ctrl');
  overrideHostPlatform('iPhone');
  await render(h(Kbd, { key: 'b', keys: 'mod' }));
  assert.equal(visible(host.querySelector('[data-kbd]')), '⌘');
});

test('key names, aliases and tinykeys codes all normalise', () => {
  const text = (keys, platform = 'other') =>
    visible(doc(h(Kbd, { keys, platform })).body.firstElementChild);
  assert.equal(text('$mod+KeyK'), 'Ctrl+K');
  assert.equal(text(['Control', 'Option', 'ArrowUp']), 'Ctrl+Alt+↑');
  assert.equal(text('cmd+Digit1', 'apple'), '⌘1');
  assert.equal(text('mod++'), 'Ctrl++');
  assert.equal(text('esc'), 'Esc');
  assert.equal(text('F5'), 'F5');
  assert.equal(text('backspace', 'apple'), '⌫');
  assert.equal(text('backspace'), 'Backspace');
});

test('glyphs written as children are hidden and named', () => {
  const kbd = doc(h(Kbd, { platform: 'apple' }, '⇧⌘P')).querySelector('kbd');
  assert.equal(visible(kbd), '⇧⌘P');
  assert.equal(spoken(kbd), '시프트 커맨드 P');
  const plain = doc(h(Kbd, null, 'Ctrl+C')).querySelector('kbd');
  assert.equal(plain.innerHTML, 'Ctrl+C', 'text without glyphs stays as it is');
});

test('labels override the spoken names, separator overrides the joiner', () => {
  const kbd = doc(
    h(Kbd, {
      keys: 'mod+k',
      platform: 'other',
      separator: null,
      labels: { control: 'Control' },
    }),
  ).querySelector('[data-kbd-group]');
  assert.equal(spoken(kbd), 'Control K');
  assert.equal(kbd.querySelector('[data-kbd-separator]'), null);
});

test('size comes from the prop, then the group, then a Field', () => {
  const group = doc(
    h(Kbd.Group, { size: 'tiny', platform: 'apple' }, h(Kbd, { keys: 'mod' }), h(Kbd, null, 'G')),
  );
  const caps = [...group.querySelectorAll('kbd[data-kbd]')];
  assert.deepEqual(
    caps.map((cap) => cap.dataset.size),
    ['tiny', 'tiny'],
  );
  assert.equal(visible(caps[0]), '⌘', 'the group platform reaches its keys');
  const field = doc(
    h(
      Field,
      { size: 'tiny' },
      h(Field.Label, null, 'Search'),
      h('input'),
      h(Field.Hint, null, h(Kbd, null, 'K')),
    ),
  );
  assert.equal(field.querySelector('kbd').dataset.size, 'tiny');
  assert.equal(doc(h(Kbd, null, 'K')).querySelector('kbd').dataset.size, 'standard');
});

test('className may read the state', () => {
  const kbd = doc(
    h(Kbd, {
      keys: 'mod+k',
      platform: 'apple',
      className: (state) => `${state.platform}-${state.combination}`,
    }),
  ).querySelector('[data-kbd-group]');
  assert.match(kbd.className, /apple-true/);
});
