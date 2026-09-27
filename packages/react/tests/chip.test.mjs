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
  'Node',
  'Element',
  'HTMLElement',
  'Event',
  'KeyboardEvent',
  'MouseEvent',
  'FocusEvent',
  'getComputedStyle',
  'requestAnimationFrame',
  'cancelAnimationFrame',
])
  globalThis[name] = dom.window[name];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement: h, act, useState } = await import('react');
const { createRoot } = await import('react-dom/client');
const { renderToString } = await import('react-dom/server');
const { Chip } = await import('../dist/index.js');

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
const html = (node) => new JSDOM(renderToString(node)).window.document;
const chip = () => host.querySelector('[data-chip]');
const press = (element, key) =>
  act(async () => {
    element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  });
const frame = () => act(() => new Promise((resolve) => requestAnimationFrame(() => resolve())));

test('a static chip is a span without a role, and its text becomes the label', () => {
  const doc = html(h(Chip, null, 'Beta'));
  const root = doc.querySelector('[data-chip]');
  assert.equal(root.tagName, 'SPAN');
  assert.equal(root.hasAttribute('role'), false);
  assert.equal(root.hasAttribute('tabindex'), false);
  assert.equal(root.hasAttribute('data-disabled'), false, 'static is not disabled');
  assert.equal(root.querySelector('[data-chip-label]').textContent, 'Beta');
  assert.equal(root.dataset.variant, 'soft');
  assert.equal(root.dataset.colorScheme, 'neutral');
});

test('selectable: a real button with aria-pressed that follows onSelectedChange', async () => {
  const changes = [];
  function App() {
    const [on, setOn] = useState(false);
    return h(
      Chip,
      { selected: on, onSelectedChange: (next) => (changes.push(next), setOn(next)) },
      'Follow',
    );
  }
  await render(h(App));
  const button = chip();
  assert.equal(button.tagName, 'BUTTON');
  assert.equal(button.type, 'button');
  assert.equal(button.getAttribute('aria-pressed'), 'false');
  await act(async () => button.click());
  assert.equal(button.getAttribute('aria-pressed'), 'true');
  assert.ok(button.hasAttribute('data-selected'));
  assert.deepEqual(changes, [true]);
});

test('a controlled selected without onSelectedChange stays as the parent set it', async () => {
  await render(h(Chip, { selected: true }, 'Pinned'));
  await act(async () => chip().click());
  assert.equal(chip().getAttribute('aria-pressed'), 'true');
});

test('onClick alone makes a plain button, not a toggle', async () => {
  let clicks = 0;
  await render(h(Chip, { onClick: () => clicks++ }, 'Filter'));
  assert.equal(chip().tagName, 'BUTTON');
  assert.equal(chip().hasAttribute('aria-pressed'), false);
  await act(async () => chip().click());
  assert.equal(clicks, 1);
});

test('removable: the close button is named after the chip and removes on click, Backspace or Delete', async () => {
  let removed = 0;
  await render(h(Chip, { onRemove: () => removed++ }, 'react'));
  const close = host.querySelector('[data-chip-close]');
  const label = host.querySelector('[data-chip-label]');
  assert.equal(close.tagName, 'BUTTON');
  assert.equal(close.getAttribute('aria-label'), '삭제');
  assert.equal(close.getAttribute('aria-labelledby'), `${label.id} ${close.id}`);
  assert.ok(close.querySelector('svg'), 'a default X glyph');
  await act(async () => close.click());
  await press(close, 'Backspace');
  await press(close, 'Delete');
  await press(close, 'a');
  assert.equal(removed, 3);
});

test('the close button is a ghost IconButton in the chip color scheme and size', () => {
  const doc = html(h(Chip, { colorScheme: 'danger', size: 'tiny', onRemove: () => {} }, 'react'));
  const close = doc.querySelector('[data-chip-close]');
  assert.equal(close.type, 'button');
  assert.equal(close.dataset.variant, 'ghost');
  assert.equal(close.dataset.size, 'tiny');
  assert.match(close.className, /\[--control-ring:var\(--ids-color-danger\)\]/);
  assert.match(close.className, /(^| )size-3\.5( |$)/, 'the chip keeps its own small circle');
  assert.match(close.className, /(^| )rounded-full( |$)/);
  assert.match(close.className, /(^| )text-current( |$)/, 'in the chip text color');
});

test('a chip that is a button draws its X for the pointer and removes on Backspace', async () => {
  const events = [];
  await render(
    h(
      Chip,
      {
        defaultSelected: false,
        onSelectedChange: (next) => events.push(`selected:${next}`),
        onRemove: () => events.push('removed'),
      },
      'Open',
    ),
  );
  const button = chip();
  const close = host.querySelector('[data-chip-close]');
  assert.equal(close.tagName, 'SPAN');
  assert.equal(close.getAttribute('aria-hidden'), 'true');
  assert.equal(button.querySelector('button'), null, 'no button inside a button');
  await act(async () => close.click());
  assert.deepEqual(events, ['removed'], 'the X does not toggle the chip');
  await press(button, 'Backspace');
  assert.deepEqual(events, ['removed', 'removed']);
});

test('removing a focused chip hands focus to the next chip, or the previous at the end', async () => {
  function Tags() {
    const [tags, setTags] = useState(['a', 'b', 'c']);
    return h(
      'ul',
      null,
      tags.map((tag) =>
        h(
          'li',
          { key: tag },
          h(Chip, { onRemove: () => setTags((prev) => prev.filter((t) => t !== tag)) }, tag),
        ),
      ),
    );
  }
  await render(h(Tags));
  const closeOf = (tag) =>
    [...host.querySelectorAll('[data-chip]')]
      .find((element) => element.textContent === tag)
      ?.querySelector('[data-chip-close]');
  await act(async () => closeOf('b').focus());
  await press(closeOf('b'), 'Backspace');
  await frame();
  assert.equal(document.activeElement, closeOf('c'));
  await press(closeOf('c'), 'Delete');
  await frame();
  assert.equal(document.activeElement, closeOf('a'), 'the last one hands focus back');
});

test('disabled: nothing toggles or removes', async () => {
  let removed = 0;
  await render(h(Chip, { disabled: true, onRemove: () => removed++ }, 'locked'));
  const close = host.querySelector('[data-chip-close]');
  assert.equal(close.disabled, true);
  assert.equal(chip().getAttribute('aria-disabled'), 'true');
  await press(close, 'Backspace');
  assert.equal(removed, 0);
  await render(h(Chip, { disabled: true, defaultSelected: false }, 'toggle'));
  assert.equal(chip().disabled, true);
});

test('a custom close label replaces the joined name; asChild keeps the child as it is', () => {
  const custom = html(
    h(
      Chip,
      { onRemove: () => {} },
      'react',
      h(Chip.Close, { 'aria-label': 'Remove react tag' }, 'x'),
    ),
  ).querySelector('[data-chip-close]');
  assert.equal(custom.getAttribute('aria-label'), 'Remove react tag');
  assert.equal(custom.hasAttribute('aria-labelledby'), false);
  assert.equal(custom.textContent, 'x');
  const link = html(
    h(Chip, { asChild: true }, h('a', { href: '/tags/react' }, 'react')),
  ).querySelector('a');
  assert.ok(link.hasAttribute('data-chip'));
  assert.equal(link.hasAttribute('role'), false);
  assert.equal(link.textContent, 'react');
});

test('className takes the chip state', () => {
  const root = html(
    h(Chip, { defaultSelected: true, className: (state) => (state.selected ? 'on' : 'off') }, 'x'),
  ).querySelector('[data-chip]');
  assert.ok(root.classList.contains('on'));
});

test('parts outside Chip throw', () => {
  assert.throws(() => renderToString(h(Chip.Close)), /inside `<Chip>`/);
});
