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
])
  globalThis[name] = dom.window[name];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement: h, act } = await import('react');
const { createRoot } = await import('react-dom/client');
const { renderToString } = await import('react-dom/server');
const { Item } = await import('../dist/index.js');

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
const item = () => host.querySelector('[data-item]');

function row(props = {}) {
  return h(
    Item,
    props,
    h(Item.Media, { variant: 'soft' }, h('svg')),
    h(
      Item.Content,
      null,
      h(Item.Title, null, 'Alice Kim'),
      h(Item.Description, null, 'Sent the slides'),
    ),
    h(Item.Actions, null, h('button', { type: 'button' }, 'Archive')),
  );
}

test('SSR: a static row has no role, and every part marks itself', () => {
  const doc = html(row());
  const root = doc.querySelector('[data-item]');
  assert.equal(root.hasAttribute('role'), false);
  assert.equal(root.hasAttribute('data-disabled'), false);
  assert.equal(root.dataset.variant, 'ghost');
  assert.ok(root.className.includes('concentric-p-3'));
  for (const part of ['media', 'content', 'title', 'description', 'actions'])
    assert.ok(doc.querySelector(`[data-item-${part}]`), part);
  assert.ok(
    doc
      .querySelector('[data-item-content]')
      .className.includes('[&+[data-item-content]]:flex-none'),
    'a second content block keeps its width',
  );
  const media = doc.querySelector('[data-item-media]');
  assert.equal(media.dataset.variant, 'soft');
  assert.ok(media.className.includes('group-has-[[data-item-description]]/item:self-start'));
});

test('onClick: a button named by its title that ignores presses on its own actions', async () => {
  let opened = 0;
  let archived = 0;
  await render(
    h(
      Item,
      { onClick: () => opened++ },
      h(Item.Content, null, h(Item.Title, null, 'Alice Kim'), h(Item.Description, null, 'Hi')),
      h(Item.Actions, null, h('button', { type: 'button', onClick: () => archived++ }, 'Archive')),
    ),
  );
  const element = item();
  assert.equal(element.getAttribute('role'), 'button');
  assert.equal(element.getAttribute('tabindex'), '0');
  assert.equal(element.getAttribute('aria-labelledby'), host.querySelector('[data-item-title]').id);
  assert.equal(
    element.getAttribute('aria-describedby'),
    host.querySelector('[data-item-description]').id,
  );
  await act(async () => host.querySelector('[data-item-actions] button').click());
  assert.deepEqual([opened, archived], [0, 1]);
  await act(async () => {
    element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  });
  assert.equal(opened, 1);
});

test('selected: aria-pressed on a button row, left out when aria-current says it', async () => {
  await render(h(Item, { onClick: () => {}, selected: true }, 'Home'));
  assert.equal(item().getAttribute('aria-pressed'), 'true');
  assert.ok(item().hasAttribute('data-selected'));
  await render(h(Item, { onClick: () => {}, selected: false }, 'Home'));
  assert.equal(item().getAttribute('aria-pressed'), 'false');
  await render(h(Item, { onClick: () => {}, selected: true, 'aria-current': 'page' }, 'Home'));
  assert.equal(item().hasAttribute('aria-pressed'), false);
  assert.equal(item().getAttribute('aria-current'), 'page');
  await render(h(Item, { selected: true }, 'Static'));
  assert.equal(item().hasAttribute('aria-pressed'), false, 'a static row has no pressed state');
  assert.ok(item().hasAttribute('data-selected'));
});

test('disabled rows are out of the tab order and do not press', async () => {
  let opened = 0;
  await render(h(Item, { onClick: () => opened++, disabled: true }, 'Locked'));
  assert.equal(item().getAttribute('aria-disabled'), 'true');
  assert.equal(item().hasAttribute('tabindex'), false);
  await act(async () => item().click());
  assert.equal(opened, 0);
});

test('asChild: a link row keeps its role and is named by its title', async () => {
  await render(h(Item, { asChild: true }, h('a', { href: '#home' }, h(Item.Title, null, 'Home'))));
  const link = host.querySelector('a');
  assert.equal(link, item());
  assert.equal(link.hasAttribute('role'), false);
  assert.ok(link.hasAttribute('data-interactive'));
  assert.equal(link.getAttribute('aria-labelledby'), host.querySelector('[data-item-title]').id);
});

test('Group: a list with an item per row; separators are hidden and size is shared', () => {
  const doc = html(
    h(
      Item.Group,
      { size: 'tiny', 'aria-label': 'Menu' },
      h(Item, null, 'One'),
      h(Item.Separator),
      h(Item, null, 'Two'),
      h('li', { className: 'own' }, h(Item, null, 'Three')),
    ),
  );
  const list = doc.querySelector('ul');
  assert.equal(list.getAttribute('role'), 'list');
  const children = [...list.children];
  assert.deepEqual(
    children.map((child) => child.tagName),
    ['LI', 'LI', 'LI', 'LI'],
  );
  assert.equal(children[1].getAttribute('aria-hidden'), 'true');
  assert.ok(children[1].hasAttribute('data-item-separator'));
  assert.ok(children[3].classList.contains('own'), 'an li is not wrapped again');
  assert.ok([...doc.querySelectorAll('[data-item]')].every((row) => row.dataset.size === 'tiny'));
  assert.equal(html(h(Item.Separator)).querySelector('hr').tagName, 'HR');
});

test('className takes the row state', () => {
  const root = html(
    h(Item, { selected: true, className: (state) => (state.selected ? 'on' : 'off') }, 'x'),
  ).querySelector('[data-item]');
  assert.ok(root.classList.contains('on'));
});

test('parts outside Item throw', () => {
  assert.throws(() => renderToString(h(Item.Title, null, 'x')), /inside `<Item>`/);
});
