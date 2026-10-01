import type { ReactNode } from 'react';

import { renderToString } from 'react-dom/server';
import { expect, test } from 'vitest';

import { Avatar, Badge } from '../src';

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');

function renderBadge(
  props: Badge.Props,
  children: ReactNode = <button type="button">Inbox</button>,
) {
  const doc = parse(renderToString(<Badge {...props}>{children}</Badge>));
  return {
    root: doc.querySelector<HTMLElement>('[data-badge]')!,
    indicator: doc.querySelector<HTMLElement>('[data-badge-indicator]')!,
    anchor: doc.querySelector('button')!,
  };
}

test('a count is capped at max, and zero stays mounted but invisible', () => {
  expect(renderBadge({ content: 99 }).indicator.textContent).toBe('99');
  const over = renderBadge({ content: 100 }).indicator;
  expect(over.textContent).toBe('99+');
  expect(over.hasAttribute('data-overflow')).toBe(true);
  expect(renderBadge({ content: 1200, max: 999 }).indicator.textContent).toBe('999+');
  const zero = renderBadge({ content: 0 }).indicator;
  expect(zero.hasAttribute('data-invisible'), 'hidden, not removed, so it can animate back').toBe(
    true,
  );
  expect(renderBadge({ content: 0, showZero: true }).indicator.hasAttribute('data-invisible')).toBe(
    false,
  );
  expect(renderBadge({ content: -4, showZero: true }).indicator.textContent).toBe('0');
  expect(renderBadge({ content: 'New' }).indicator.textContent).toBe('New');
});

test('an unlabelled count describes the element it is attached to', () => {
  const { indicator, anchor } = renderBadge({ content: 3 });
  expect(indicator.getAttribute('aria-hidden')).toBe('true');
  expect(anchor.getAttribute('aria-describedby')).toBe(indicator.id);
  const merged = renderBadge(
    { content: 3 },
    <button type="button" aria-describedby="hint">
      Inbox
    </button>,
  );
  expect(merged.anchor.getAttribute('aria-describedby')).toBe(`hint ${merged.indicator.id}`);
  expect(renderBadge({ content: 0 }).anchor.hasAttribute('aria-describedby')).toBe(false);
  expect(renderBadge({ dot: true }).anchor.hasAttribute('aria-describedby')).toBe(false);
});

test('a labelled badge is a live region that reads its sentence, even while invisible', () => {
  const { indicator, anchor } = renderBadge({ content: 3, 'aria-label': '읽지 않은 메일 3통' });
  expect(indicator.getAttribute('role')).toBe('status');
  expect(indicator.hasAttribute('aria-hidden')).toBe(false);
  expect(indicator.querySelector('.sr-only')?.textContent).toBe('읽지 않은 메일 3통');
  expect(indicator.querySelector('[aria-hidden=true]')?.textContent).toBe('3');
  expect(anchor.hasAttribute('aria-describedby')).toBe(false);
  const hidden = renderBadge({ content: 0, 'aria-label': '읽지 않은 메일 0통' }).indicator;
  expect(hidden.getAttribute('role')).toBe('status');
  expect(hidden.hasAttribute('data-invisible')).toBe(true);
});

test('dot draws no text; invisible hides without unmounting', () => {
  const dot = renderBadge({ dot: true, colorScheme: 'success' }).indicator;
  expect(dot.hasAttribute('data-dot')).toBe(true);
  expect(dot.textContent).toBe('');
  expect(dot.getAttribute('aria-hidden')).toBe('true');
  const off = renderBadge({ dot: true, invisible: true, 'aria-label': 'Offline' }).indicator;
  expect(off.hasAttribute('data-invisible')).toBe(true);
  expect(off.textContent).toBe('Offline');
});

test('placement is logical and a round Avatar pulls the badge onto its edge', () => {
  const { root, indicator } = renderBadge({ content: 1, placement: 'bottom-start' });
  expect(root.dataset.placement).toBe('bottom-start');
  expect(indicator.classList.contains('pointer-events-none'), 'clicks reach the anchor').toBe(true);
  expect(indicator.className).toContain('start-(--badge-inset)');
  expect(indicator.className).toContain('rtl:translate-x-1/2');
  const onAvatar = renderBadge({ content: 1 }, <Avatar name="Alice Kim" />).root;
  expect(onAvatar.className).toContain(
    'has-[>[data-avatar][data-shape=circle]]:[--badge-inset:14.6%]',
  );
  const forced = renderBadge(
    { content: 1, shape: 'rectangular' },
    <Avatar name="Alice Kim" />,
  ).root;
  expect(forced.className, 'an explicit shape wins').not.toContain('14.6%');
  expect(renderBadge({ content: 1, shape: 'circular' }).root.className).toContain(
    '[--badge-inset:14.6%]',
  );
});

test('without children the badge renders in place', () => {
  const doc = parse(renderToString(<Badge content={12} variant="soft" className="x" />));
  const badge = doc.querySelector<HTMLElement>('[data-badge]')!;
  expect(badge.hasAttribute('data-badge-indicator')).toBe(true);
  expect(badge.textContent).toBe('12');
  expect(badge.classList.contains('x')).toBe(true);
  expect(badge.className).not.toContain('absolute');
});

test('children left as false by a condition count as no anchor', () => {
  const doc = parse(renderToString(<Badge content={3}>{false}</Badge>));
  const badge = doc.querySelector<HTMLElement>('[data-badge]')!;
  expect(badge.hasAttribute('data-badge-indicator')).toBe(true);
  expect(badge.className).not.toContain('absolute');
});

test('className takes the badge state', () => {
  const { root } = renderBadge({
    content: 120,
    className: (state) => `count-${state.count} over-${state.overflowed}`,
  });
  expect(root.classList.contains('count-120')).toBe(true);
  expect(root.classList.contains('over-true')).toBe(true);
});
