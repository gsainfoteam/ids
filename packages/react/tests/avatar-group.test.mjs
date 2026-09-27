import assert from 'node:assert/strict';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';

const { createElement: h } = await import('react');
const { renderToString } = await import('react-dom/server');
const { Avatar, AvatarGroup } = await import('../dist/index.js');

const NAMES = ['Alice Kim', 'Bob Lee', 'Carol Park', 'Dan Oh', 'Eve Choi'];
const people = (count = NAMES.length) =>
  NAMES.slice(0, count).map((name) => h(Avatar, { key: name, name }));

function render(props, children = people()) {
  const doc = new JSDOM(renderToString(h(AvatarGroup, props, children))).window.document;
  const group = doc.querySelector('[data-avatar-group]');
  const items = [...group.children];
  return { doc, group, items };
}
const cutouts = (items) =>
  items.map(
    (item) => item.querySelector('[data-avatar]')?.dataset.cutout ?? item.dataset.cutout ?? 'none',
  );

test('max shows that many avatars and gathers the rest into a labelled +N', () => {
  const { group, items } = render({ max: 3, 'aria-label': 'Attendees' });
  assert.equal(group.getAttribute('role'), 'group');
  assert.equal(group.getAttribute('aria-label'), 'Attendees');
  assert.equal(items.length, 4);
  const overflow = items[3];
  assert.ok(overflow.hasAttribute('data-avatar-group-overflow'));
  assert.equal(overflow.getAttribute('role'), 'img');
  assert.equal(overflow.getAttribute('aria-label'), '외 2명');
  assert.equal(overflow.textContent, '+2');
  assert.equal(
    overflow.querySelector('[dir=ltr]').textContent,
    '+2',
    'the count keeps its sign in RTL',
  );
  assert.equal(overflow.getAttribute('title'), 'Dan Oh, Eve Choi', 'hovering names who it hides');
  assert.deepEqual(
    [group.dataset.layout, group.dataset.stacking, group.dataset.size],
    ['stack', 'first-on-top', 'standard'],
  );
});

test('stacking decides which side of each avatar is cut out; inline cuts nothing', () => {
  assert.deepEqual(cutouts(render({ max: 3 }).items), ['none', 'start', 'start', 'start']);
  assert.deepEqual(cutouts(render({ max: 3, stacking: 'last-on-top' }).items), [
    'end',
    'end',
    'end',
    'none',
  ]);
  assert.deepEqual(cutouts(render({ max: 3, layout: 'inline' }).items), [
    'none',
    'none',
    'none',
    'none',
  ]);
});

test('total counts people that were not rendered', () => {
  const { items } = render({ total: 42 }, people(3));
  assert.equal(items.length, 4);
  assert.equal(items[3].getAttribute('aria-label'), '외 39명');
  assert.equal(items[3].textContent, '+39');
  assert.equal(items[3].hasAttribute('title'), false, 'people never rendered cannot be named');
  const { items: fewer } = render({ total: 2 }, people(3));
  assert.equal(fewer.length, 3, 'a total below the rendered count is ignored');
});

test('without overflow there is no +N, even when AvatarGroup.Overflow is declared', () => {
  const { items } = render({ max: 5 }, [h(AvatarGroup.Overflow, { key: 'o' }), ...people(3)]);
  assert.equal(items.length, 3);
  assert.equal(
    items.some((item) => item.hasAttribute('data-avatar-group-overflow')),
    false,
  );
});

test('a declared Overflow keeps its place and renders from the count', () => {
  const { items } = render({ max: 2, overflowLabel: (count) => `and ${count} more` }, [
    h(
      AvatarGroup.Overflow,
      { key: 'o', className: (state) => `count-${state.count}` },
      (state) => `${state.count}+`,
    ),
    ...people(),
  ]);
  const [overflow] = items;
  assert.ok(overflow.hasAttribute('data-avatar-group-overflow'));
  assert.equal(overflow.getAttribute('aria-label'), 'and 3 more');
  assert.equal(overflow.textContent, '3+');
  assert.ok(overflow.classList.contains('count-3'));
  assert.deepEqual(cutouts(items), ['none', 'start', 'start']);
});

test('size and shape come from the group unless an avatar sets its own', () => {
  const { items } = render({ size: 'tiny', shape: 'square' }, [
    h(Avatar, { key: 'a', name: 'Alice Kim' }),
    h(Avatar, { key: 'b', name: 'Bob Lee', size: 'standard', shape: 'circle' }),
  ]);
  assert.deepEqual([items[0].dataset.size, items[0].dataset.shape], ['tiny', 'square']);
  assert.deepEqual([items[1].dataset.size, items[1].dataset.shape], ['standard', 'circle']);
});

test('a wrapped avatar still counts as one item and gets its cut-out', () => {
  const { items } = render({ max: 2 }, [
    h('a', { key: 'a', href: '/alice' }, h(Avatar, { name: 'Alice Kim' })),
    h('a', { key: 'b', href: '/bob' }, h(Avatar, { name: 'Bob Lee' })),
    h('a', { key: 'c', href: '/carol' }, h(Avatar, { name: 'Carol Park' })),
  ]);
  assert.deepEqual(
    items.map((item) => item.tagName),
    ['A', 'A', 'SPAN'],
  );
  assert.deepEqual(cutouts(items), ['none', 'start', 'start']);
});

test('an invalid max is clamped instead of throwing', () => {
  const { items } = render({ max: 0 });
  assert.equal(items.length, 2);
  assert.equal(items[1].textContent, '+4');
});

test('Overflow outside a group throws', () => {
  assert.throws(() => renderToString(h(AvatarGroup.Overflow)), /inside `<AvatarGroup>`/);
});
