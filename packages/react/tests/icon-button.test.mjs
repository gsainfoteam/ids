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
const { createElement: h, act, forwardRef, memo } = await import('react');
const { createRoot } = await import('react-dom/client');
const { renderToString } = await import('react-dom/server');
const { ChevronDownIcon, PlusIcon, Squares2X2Icon, XMarkIcon } =
  await import('@heroicons/react/24/outline');
const { ButtonGroup, IconButton } = await import('../dist/index.js');

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
const ssr = (node) => new JSDOM(renderToString(node)).window.document;
const labelOf = (props) =>
  ssr(h(IconButton, props)).querySelector('button').getAttribute('aria-label');

test('without aria-label the name comes from the icon component', () => {
  assert.equal(labelOf({ icon: h(PlusIcon) }), 'Plus');
  assert.equal(labelOf({ icon: h(ChevronDownIcon) }), 'Chevron down');
  assert.equal(labelOf({ icon: h(XMarkIcon) }), 'X mark');
  assert.equal(labelOf({ icon: h(Squares2X2Icon) }), 'Squares 2 x 2');
});

test('an explicit name wins; the icon title or aria-label comes before the component name', () => {
  assert.equal(labelOf({ icon: h(PlusIcon), 'aria-label': '새 항목' }), '새 항목');
  assert.equal(labelOf({ icon: h(PlusIcon, { title: '추가' }) }), '추가');
  assert.equal(labelOf({ icon: h(PlusIcon, { 'aria-label': '더하기' }) }), '더하기');
  assert.equal(labelOf({ icon: h(PlusIcon), 'aria-labelledby': 'heading' }), null);
  assert.equal(labelOf({ icon: h(PlusIcon), title: '툴팁' }), null);
});

test('a displayName is used through memo and forwardRef; a minified name is not', () => {
  const Star = forwardRef(function jt(props, ref) {
    return h('svg', { ...props, ref });
  });
  assert.equal(labelOf({ icon: h(Star) }), null);
  Star.displayName = 'StarIcon';
  assert.equal(labelOf({ icon: h(memo(Star)) }), 'Star');
  const Lucide = (props) => h('svg', props);
  Lucide.displayName = 'ArrowUpRight';
  assert.equal(labelOf({ icon: h(Lucide) }), 'Arrow up right');
  const Tabler = (props) => h('svg', props);
  Tabler.displayName = 'IconSettings';
  assert.equal(labelOf({ icon: h(Tabler) }), 'Settings');
});

test('the square carries the icon, a ghost variant and the group size', async () => {
  await render(
    h(
      ButtonGroup,
      { size: 'tiny' },
      h(IconButton, { id: 'inherit', icon: h(PlusIcon) }),
      h(IconButton, { id: 'own', size: 'standard', variant: 'outline', icon: h(PlusIcon) }),
    ),
  );
  const inherit = host.querySelector('#inherit');
  assert.equal(inherit.type, 'button');
  assert.equal(inherit.dataset.variant, 'ghost');
  assert.equal(inherit.dataset.size, 'tiny');
  assert.ok(inherit.querySelector('svg'));
  assert.equal(host.querySelector('#own').dataset.size, 'standard');
});

test('asChild draws a link as the square; the link keeps its own name', async () => {
  await render(
    h(
      'div',
      null,
      h(IconButton, { asChild: true, icon: h(PlusIcon) }, h('a', { href: '#new', id: 'derived' })),
      h(
        IconButton,
        { asChild: true },
        h('a', { href: '#docs', id: 'own', 'aria-label': '문서' }, h(XMarkIcon)),
      ),
    ),
  );
  const derived = host.querySelector('#derived');
  assert.equal(derived.getAttribute('aria-label'), 'Plus');
  assert.ok(derived.querySelector('svg'));
  const own = host.querySelector('#own');
  assert.equal(own.getAttribute('aria-label'), '문서');
  assert.equal(own.getAttribute('href'), '#docs');
});

test('children and a missing icon are rejected', () => {
  assert.throws(() => renderToString(h(IconButton, { icon: h(PlusIcon) }, 'x')), /icon` prop, not/);
  assert.throws(() => renderToString(h(IconButton, {})), /`icon` prop is required/);
});
