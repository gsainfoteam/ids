import assert from 'node:assert/strict';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';

const { createElement: h } = await import('react');
const { renderToString } = await import('react-dom/server');
const { Avatar, Badge } = await import('../dist/index.js');

function render(props, children = h('button', { type: 'button' }, 'Inbox')) {
  const doc = new JSDOM(renderToString(h(Badge, props, children))).window.document;
  return {
    doc,
    root: doc.querySelector('[data-badge]'),
    indicator: doc.querySelector('[data-badge-indicator]'),
    anchor: doc.querySelector('button'),
  };
}

test('a count is capped at max, and zero stays mounted but invisible', () => {
  assert.equal(render({ content: 99 }).indicator.textContent, '99');
  const over = render({ content: 100 }).indicator;
  assert.equal(over.textContent, '99+');
  assert.ok(over.hasAttribute('data-overflow'));
  assert.equal(render({ content: 1200, max: 999 }).indicator.textContent, '999+');
  const zero = render({ content: 0 }).indicator;
  assert.ok(zero.hasAttribute('data-invisible'), 'hidden, not removed, so it can animate back');
  assert.equal(
    render({ content: 0, showZero: true }).indicator.hasAttribute('data-invisible'),
    false,
  );
  assert.equal(render({ content: -4, showZero: true }).indicator.textContent, '0');
  assert.equal(render({ content: 'New' }).indicator.textContent, 'New');
});

test('an unlabelled count describes the element it is attached to', () => {
  const { indicator, anchor } = render({ content: 3 });
  assert.equal(indicator.getAttribute('aria-hidden'), 'true');
  assert.equal(anchor.getAttribute('aria-describedby'), indicator.id);
  const merged = render(
    { content: 3 },
    h('button', { type: 'button', 'aria-describedby': 'hint' }, 'Inbox'),
  );
  assert.equal(merged.anchor.getAttribute('aria-describedby'), `hint ${merged.indicator.id}`);
  assert.equal(render({ content: 0 }).anchor.hasAttribute('aria-describedby'), false);
  assert.equal(render({ dot: true }).anchor.hasAttribute('aria-describedby'), false);
});

test('a labelled badge is a live region that reads its sentence, even while invisible', () => {
  const { indicator, anchor } = render({ content: 3, 'aria-label': '읽지 않은 메일 3통' });
  assert.equal(indicator.getAttribute('role'), 'status');
  assert.equal(indicator.hasAttribute('aria-hidden'), false);
  assert.equal(indicator.querySelector('.sr-only').textContent, '읽지 않은 메일 3통');
  assert.equal(indicator.querySelector('[aria-hidden=true]').textContent, '3');
  assert.equal(anchor.hasAttribute('aria-describedby'), false);
  const hidden = render({ content: 0, 'aria-label': '읽지 않은 메일 0통' }).indicator;
  assert.equal(hidden.getAttribute('role'), 'status');
  assert.ok(hidden.hasAttribute('data-invisible'));
});

test('dot draws no text; invisible hides without unmounting', () => {
  const dot = render({ dot: true, colorScheme: 'success' }).indicator;
  assert.ok(dot.hasAttribute('data-dot'));
  assert.equal(dot.textContent, '');
  assert.equal(dot.getAttribute('aria-hidden'), 'true');
  const off = render({ dot: true, invisible: true, 'aria-label': 'Offline' }).indicator;
  assert.ok(off.hasAttribute('data-invisible'));
  assert.equal(off.textContent, 'Offline');
});

test('placement is logical and a round Avatar pulls the badge onto its edge', () => {
  const { root, indicator } = render({ content: 1, placement: 'bottom-start' });
  assert.equal(root.dataset.placement, 'bottom-start');
  assert.ok(indicator.classList.contains('pointer-events-none'), 'clicks reach the anchor');
  assert.ok(indicator.className.includes('start-(--badge-inset)'));
  assert.ok(indicator.className.includes('rtl:translate-x-1/2'));
  const onAvatar = render({ content: 1 }, h(Avatar, { name: 'Alice Kim' })).root;
  assert.ok(
    onAvatar.className.includes('has-[>[data-avatar][data-shape=circle]]:[--badge-inset:14.6%]'),
  );
  const forced = render(
    { content: 1, shape: 'rectangular' },
    h(Avatar, { name: 'Alice Kim' }),
  ).root;
  assert.equal(forced.className.includes('14.6%'), false, 'an explicit shape wins');
  assert.ok(
    render({ content: 1, shape: 'circular' }).root.className.includes('[--badge-inset:14.6%]'),
  );
});

test('without children the badge renders in place', () => {
  const doc = new JSDOM(renderToString(h(Badge, { content: 12, variant: 'soft', className: 'x' })))
    .window.document;
  const badge = doc.querySelector('[data-badge]');
  assert.ok(badge.hasAttribute('data-badge-indicator'));
  assert.equal(badge.textContent, '12');
  assert.ok(badge.classList.contains('x'));
  assert.equal(badge.className.includes('absolute'), false);
});

test('className takes the badge state', () => {
  const { root } = render({
    content: 120,
    className: (state) => `count-${state.count} over-${state.overflowed}`,
  });
  assert.ok(root.classList.contains('count-120'));
  assert.ok(root.classList.contains('over-true'));
});
