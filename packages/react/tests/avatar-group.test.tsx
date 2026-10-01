import { useLayoutEffect, useRef, type ReactNode } from 'react';

import { renderToString } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import { Avatar, AvatarGroup } from '../src';

const NAMES = ['Alice Kim', 'Bob Lee', 'Carol Park', 'Dan Oh', 'Eve Choi'];
const people = (count = NAMES.length) =>
  NAMES.slice(0, count).map((name) => <Avatar key={name} name={name} />);

function renderGroup(props: AvatarGroup.Props, children: ReactNode = people()) {
  const html = renderToString(<AvatarGroup {...props}>{children}</AvatarGroup>);
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const group = doc.querySelector<HTMLElement>('[data-avatar-group]')!;
  const items = Array.from(group.children) as HTMLElement[];
  return { group, items };
}
const cutouts = (items: HTMLElement[]) =>
  items.map(
    (item) =>
      item.querySelector<HTMLElement>('[data-avatar]')?.dataset.cutout ??
      item.dataset.cutout ??
      'none',
  );

test('max shows that many avatars and gathers the rest into a labelled +N', () => {
  const { group, items } = renderGroup({ max: 3, 'aria-label': 'Attendees' });
  expect(group.getAttribute('role')).toBe('group');
  expect(group.getAttribute('aria-label')).toBe('Attendees');
  expect(items).toHaveLength(4);
  const overflow = items[3]!;
  expect(overflow.hasAttribute('data-avatar-group-overflow')).toBe(true);
  expect(overflow.getAttribute('role')).toBe('img');
  expect(overflow.getAttribute('aria-label')).toBe('외 2명');
  expect(overflow.textContent).toBe('+2');
  expect(overflow.querySelector('[dir=ltr]')?.textContent, 'the count keeps its sign in RTL').toBe(
    '+2',
  );
  expect(overflow.getAttribute('title'), 'hovering names who it hides').toBe('Dan Oh, Eve Choi');
  expect([group.dataset.layout, group.dataset.stacking, group.dataset.size]).toEqual([
    'stack',
    'first-on-top',
    'standard',
  ]);
});

test('stacking decides which side of each avatar is cut out; inline cuts nothing', () => {
  expect(cutouts(renderGroup({ max: 3 }).items)).toEqual(['none', 'start', 'start', 'start']);
  expect(cutouts(renderGroup({ max: 3, stacking: 'last-on-top' }).items)).toEqual([
    'end',
    'end',
    'end',
    'none',
  ]);
  expect(cutouts(renderGroup({ max: 3, layout: 'inline' }).items)).toEqual([
    'none',
    'none',
    'none',
    'none',
  ]);
});

test('total counts people that were not rendered', () => {
  const { items } = renderGroup({ total: 42 }, people(3));
  expect(items).toHaveLength(4);
  expect(items[3]!.getAttribute('aria-label')).toBe('외 39명');
  expect(items[3]!.textContent).toBe('+39');
  expect(items[3]!.hasAttribute('title'), 'people never rendered cannot be named').toBe(false);
  const { items: fewer } = renderGroup({ total: 2 }, people(3));
  expect(fewer, 'a total below the rendered count is ignored').toHaveLength(3);
});

test('without overflow there is no +N, even when AvatarGroup.Overflow is declared', () => {
  const { items } = renderGroup({ max: 5 }, [<AvatarGroup.Overflow key="o" />, ...people(3)]);
  expect(items).toHaveLength(3);
  expect(items.some((item) => item.hasAttribute('data-avatar-group-overflow'))).toBe(false);
});

test('a declared Overflow keeps its place and renders from the count', () => {
  const { items } = renderGroup({ max: 2, overflowLabel: (count) => `and ${count} more` }, [
    <AvatarGroup.Overflow key="o" className={(state) => `count-${state.count}`}>
      {(state) => `${state.count}+`}
    </AvatarGroup.Overflow>,
    ...people(),
  ]);
  const [overflow] = items;
  expect(overflow!.hasAttribute('data-avatar-group-overflow')).toBe(true);
  expect(overflow!.getAttribute('aria-label')).toBe('and 3 more');
  expect(overflow!.textContent).toBe('3+');
  expect(overflow!.classList.contains('count-3')).toBe(true);
  expect(cutouts(items)).toEqual(['none', 'start', 'start']);
});

test('size and shape come from the group unless an avatar sets its own', () => {
  const { items } = renderGroup({ size: 'tiny', shape: 'square' }, [
    <Avatar key="a" name="Alice Kim" />,
    <Avatar key="b" name="Bob Lee" size="standard" shape="circle" />,
  ]);
  expect([items[0]!.dataset.size, items[0]!.dataset.shape]).toEqual(['tiny', 'square']);
  expect([items[1]!.dataset.size, items[1]!.dataset.shape]).toEqual(['standard', 'circle']);
});

test('a wrapped avatar still counts as one item and gets its cut-out', () => {
  const { items } = renderGroup({ max: 2 }, [
    <a key="a" href="/alice">
      <Avatar name="Alice Kim" />
    </a>,
    <a key="b" href="/bob">
      <Avatar name="Bob Lee" />
    </a>,
    <a key="c" href="/carol">
      <Avatar name="Carol Park" />
    </a>,
  ]);
  expect(items.map((item) => item.tagName)).toEqual(['A', 'A', 'SPAN']);
  expect(cutouts(items)).toEqual(['none', 'start', 'start']);
});

test('an invalid max is clamped instead of throwing', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const { items } = renderGroup({ max: 0 });
  expect(warn).toHaveBeenCalledWith('[IDS] AvatarGroup: max must be at least 1.');
  warn.mockRestore();
  expect(items).toHaveLength(2);
  expect(items[1]!.textContent).toBe('+4');
});

test('Overflow outside a group throws', () => {
  expect(() => renderToString(<AvatarGroup.Overflow />)).toThrow(/inside `<AvatarGroup>`/);
});

function AvatarWithOpenPopover({ name }: { name: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => ref.current?.showPopover(), []);
  return (
    <>
      <Avatar name={name} />
      <div ref={ref} popover="manual" data-testid="popover" className="fixed m-0">
        {name}
      </div>
    </>
  );
}

test('an open popover beside the stacked avatars is not pulled into the overlap', async () => {
  const screen = await render(
    <AvatarGroup>
      <Avatar name="Alice Kim" />
      <AvatarWithOpenPopover name="Bob Lee" />
    </AvatarGroup>,
  );
  const popover = screen.getByTestId('popover').element() as HTMLElement;
  const avatars = screen.container.querySelectorAll<HTMLElement>('[data-avatar]');
  expect(getComputedStyle(avatars[1]!).marginInlineStart).toBe('-10px');
  expect(getComputedStyle(popover).marginInlineStart).toBe('0px');
});
