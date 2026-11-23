import type { ReactElement } from 'react';

import { renderToString } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import { Avatar, Badge, Button, IdsProvider } from '../src';
import { testTheme } from './theme';

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');

function renderBadge(
  props: Omit<Badge.Props, 'children'>,
  children: ReactElement = <button type="button">Inbox</button>,
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
  expect(renderBadge({}).anchor.hasAttribute('aria-describedby')).toBe(false);
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

test('no content draws a dot; invisible hides without unmounting', () => {
  const dot = renderBadge({ colorScheme: 'success' }).indicator;
  expect(dot.hasAttribute('data-dot')).toBe(true);
  expect(dot.textContent).toBe('');
  expect(dot.getAttribute('aria-hidden')).toBe('true');
  const off = renderBadge({ invisible: true, 'aria-label': 'Offline' }).indicator;
  expect(off.hasAttribute('data-invisible')).toBe(true);
  expect(off.textContent).toBe('Offline');
});

test('placement is logical and starts at the corner until the client measures it', () => {
  const { root, indicator } = renderBadge({ content: 1, placement: 'bottom-start' });
  expect(root.dataset.placement).toBe('bottom-start');
  expect(indicator.classList.contains('pointer-events-none'), 'clicks reach the anchor').toBe(true);
  expect(indicator.className).toContain('start-(--badge-inset-x)');
  expect(indicator.className).toContain('rtl:translate-x-1/2');
  const onAvatar = renderBadge({ content: 1 }, <Avatar name="Alice Kim" />).root;
  expect(onAvatar.className).toContain('[--badge-inset-x:0px]');
  expect(onAvatar.getAttribute('style'), 'the server writes no measured inset').toBeNull();
});

test('a Badge that wraps no element warns in development', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  await render(<Badge content={3}>{'Inbox' as unknown as ReactElement}</Badge>);
  expect(warn).toHaveBeenCalledWith(
    '[IDS] Badge: wrap exactly one element. A badge on its own is a Chip.',
  );
  warn.mockRestore();
});

test('className takes the badge state', () => {
  const { root } = renderBadge({
    content: 120,
    className: (state) => `count-${state.count} over-${state.overflowed}`,
  });
  expect(root.classList.contains('count-120')).toBe(true);
  expect(root.classList.contains('over-true')).toBe(true);
});

test('an icon in the content takes the text size, labelled or not', async () => {
  const content = (
    <>
      <svg viewBox="0 0 24 24" />
      Done
    </>
  );
  const screen = await render(
    <>
      <Badge content={content}>
        <span />
      </Badge>
      <Badge content={content} aria-label="Done" size="tiny">
        <span />
      </Badge>
    </>,
  );
  const [standard, tiny] = Array.from(screen.container.querySelectorAll('svg'), (icon) =>
    icon.getBoundingClientRect(),
  );
  expect([standard.width, standard.height]).toEqual([12, 12]);
  expect([tiny.width, tiny.height]).toEqual([10, 10]);
});

const CIRCLE_DIAGONAL = 1 - Math.SQRT1_2;
const SQUIRCLE_DIAGONAL = 1 - 2 ** (-1 / 4);

function centerOf(element: Element) {
  const box = element.getBoundingClientRect();
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
}

async function renderOnTarget(target: ReactElement, placement: Badge.Placement = 'top-end') {
  const screen = await render(
    <IdsProvider theme={testTheme}>
      <Badge content={3} placement={placement}>
        {target}
      </Badge>
    </IdsProvider>,
  );
  const root = screen.container.querySelector<HTMLElement>('[data-badge]')!;
  return {
    root,
    target: root.firstElementChild as HTMLElement,
    indicator: root.querySelector<HTMLElement>('[data-badge-indicator]')!,
  };
}

function radiusOf(element: Element) {
  return Number.parseFloat(getComputedStyle(element).borderTopRightRadius);
}

async function expectCenterAt(indicator: Element, x: number, y: number) {
  await expect.poll(() => centerOf(indicator).x).toBeCloseTo(x, 0);
  expect(Math.abs(centerOf(indicator).x - x)).toBeLessThanOrEqual(1);
  expect(Math.abs(centerOf(indicator).y - y)).toBeLessThanOrEqual(1);
}

test('on a round Avatar the badge sits on the circle, 14.6% in from the corner', async () => {
  const { root, target, indicator } = await renderOnTarget(<Avatar name="Alice Kim" />);
  const box = target.getBoundingClientRect();
  expect(box.width).toBe(40);

  await expectCenterAt(indicator, box.right - 40 * 0.146, box.top + 40 * 0.146);
  expect(Number.parseFloat(root.style.getPropertyValue('--badge-inset-x'))).toBeCloseTo(
    20 * CIRCLE_DIAGONAL,
    2,
  );
});

test('on a 10px Button the badge sits on its corner curve', async () => {
  const { target, indicator } = await renderOnTarget(<Button>Inbox</Button>);
  const box = target.getBoundingClientRect();
  const radius = radiusOf(target);
  expect(radius).toBe(10);

  await expectCenterAt(
    indicator,
    box.right - radius * CIRCLE_DIAGONAL,
    box.top + radius * CIRCLE_DIAGONAL,
  );
  const center = { x: box.right - radius, y: box.top + radius };
  const badge = centerOf(indicator);
  expect(Math.hypot(badge.x - center.x, badge.y - center.y)).toBeCloseTo(radius, 0);
});

test('on a rounded-full pill the radius stops at half the short side', async () => {
  const { target, indicator } = await renderOnTarget(<div className="h-8 w-20 rounded-full" />);
  const box = target.getBoundingClientRect();

  await expectCenterAt(indicator, box.right - 16 * CIRCLE_DIAGONAL, box.top + 16 * CIRCLE_DIAGONAL);
});

test('on a square element the badge sits on the corner point', async () => {
  const { target, indicator } = await renderOnTarget(<div className="size-10" />, 'bottom-start');
  const box = target.getBoundingClientRect();

  await expectCenterAt(indicator, box.left, box.bottom);
});

test('right to left, top-end reads the top-left corner, scaled down the way CSS draws it', async () => {
  const screen = await render(
    <IdsProvider theme={testTheme}>
      <div dir="rtl">
        <Badge content={3}>
          <div className="size-10 rounded-tl-full" />
        </Badge>
      </div>
    </IdsProvider>,
  );
  const target = screen.container.querySelector('[data-badge]')!.firstElementChild!;
  const indicator = screen.container.querySelector('[data-badge-indicator]')!;
  const box = target.getBoundingClientRect();

  await expectCenterAt(indicator, box.left + 40 * CIRCLE_DIAGONAL, box.top + 40 * CIRCLE_DIAGONAL);
});

test('an elliptical corner insets each axis by its own radius', async () => {
  const { target, indicator } = await renderOnTarget(<div className="h-10 w-20 rounded-[50%]" />);
  const box = target.getBoundingClientRect();

  await expectCenterAt(indicator, box.right - 40 * CIRCLE_DIAGONAL, box.top + 20 * CIRCLE_DIAGONAL);
});

test('a percentage radius is measured again when the element resizes', async () => {
  const { target, indicator } = await renderOnTarget(<div className="size-10 rounded-[50%]" />);
  await expectCenterAt(
    indicator,
    target.getBoundingClientRect().right - 20 * CIRCLE_DIAGONAL,
    target.getBoundingClientRect().top + 20 * CIRCLE_DIAGONAL,
  );

  target.style.width = '80px';
  target.style.height = '80px';
  const box = target.getBoundingClientRect();
  await expectCenterAt(indicator, box.right - 40 * CIRCLE_DIAGONAL, box.top + 40 * CIRCLE_DIAGONAL);
});

test('under a squircle theme the badge sits on the superellipse', async (context) => {
  if (!CSS.supports('corner-shape', 'squircle'))
    context.skip('this engine draws no corner-shape, so every corner is round');

  const screen = await render(
    <IdsProvider theme={{ ...testTheme, cornerShape: 'squircle' }}>
      <Badge content={3}>
        <Button>Inbox</Button>
      </Badge>
    </IdsProvider>,
  );
  const target = screen.container.querySelector('[data-badge]')!.firstElementChild!;
  const indicator = screen.container.querySelector('[data-badge-indicator]')!;
  const box = target.getBoundingClientRect();
  const radius = radiusOf(target);

  await expectCenterAt(
    indicator,
    box.right - radius * SQUIRCLE_DIAGONAL,
    box.top + radius * SQUIRCLE_DIAGONAL,
  );
});
