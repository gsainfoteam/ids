import { type ReactElement } from 'react';

import { Time } from '@internationalized/date';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, expect, onTestFinished, test, vi } from 'vitest';
import { cdp, userEvent, server } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import {
  ChipField,
  Drawer,
  IdsProvider,
  Menu,
  Popover,
  ScrollArea,
  Select,
  Table,
  TextArea,
  TimePicker,
} from '../src';
import { skipWithoutCdp } from './engines';
import {
  clearOfCurve,
  MIN_THUMB_LENGTH,
  PAGE_FRACTION,
} from '../src/components/layout/scroll-area/geometry';

type Point = { x: number; y: number };

const GAP = 2;
const THICKNESS = 8;

const frameOffset = (point: Point) => {
  const frame = window.frameElement!.getBoundingClientRect();
  const scale = frame.width / window.innerWidth;
  return { x: frame.left + point.x * scale, y: frame.top + point.y * scale };
};

async function mouse(type: 'mousePressed' | 'mouseMoved' | 'mouseReleased', point: Point) {
  await cdp().send('Input.dispatchMouseEvent', {
    type,
    ...frameOffset(point),
    button: 'left',
    buttons: type === 'mouseReleased' ? 0 : 1,
    clickCount: 1,
  });
}

const centerOf = (element: Element): Point => {
  const rect = element.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
};

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

const q = <T extends Element = HTMLElement>(selector: string, scope: ParentNode = document) =>
  scope.querySelector<T>(selector)!;

const viewport = () => q('[data-scroll-area-viewport]');
const bar = (orientation: 'vertical' | 'horizontal' = 'vertical') =>
  q(`[data-scroll-area-scrollbar][data-orientation="${orientation}"]`);
const thumb = (orientation: 'vertical' | 'horizontal' = 'vertical') =>
  q('[data-scroll-area-thumb]', bar(orientation));

function Lines({ count = 40 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <p key={index} className="h-5">
          줄 {index + 1}
        </p>
      ))}
    </>
  );
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

test('SSR: the viewport scrolls natively, with one default bar per orientation and no corner', () => {
  const doc = new DOMParser().parseFromString(
    renderToString(
      <ScrollArea orientation="both" className="h-40">
        <Lines />
      </ScrollArea>,
    ),
    'text/html',
  );
  const root = doc.querySelector('[data-scroll-area]')!;
  expect(root.getAttribute('data-variant')).toBe('hover');
  expect(root.getAttribute('data-orientation')).toBe('both');
  expect(root.firstElementChild!.hasAttribute('data-scroll-area-viewport')).toBe(true);
  expect(root.querySelector('[data-scroll-area-viewport]')!.className).toMatch(/overflow-auto/);
  expect(
    [...root.querySelectorAll('[data-scroll-area-scrollbar]')].map((node) => [
      node.getAttribute('data-orientation'),
      node.getAttribute('data-placement'),
      node.getAttribute('aria-hidden'),
    ]),
  ).toEqual([
    ['vertical', 'end', 'true'],
    ['horizontal', 'end', 'true'],
  ]);
  expect(root.querySelector('[data-scroll-area-corner]')!.hasAttribute('hidden')).toBe(true);
});

test('SSR: without orientation the declared bars decide the directions, with orientation the rest get default bars', () => {
  const layoutOf = (area: ReactElement) => {
    const root = new DOMParser()
      .parseFromString(renderToString(area), 'text/html')
      .querySelector('[data-scroll-area]')!;

    return {
      orientation: root.getAttribute('data-orientation'),
      viewport: root.querySelector('[data-scroll-area-viewport]')!.className,
      bars: [...root.querySelectorAll('[data-scroll-area-scrollbar]')].map((node) =>
        node.getAttribute('data-orientation'),
      ),
    };
  };

  const horizontalOnly = layoutOf(
    <ScrollArea>
      <Lines />
      <ScrollArea.Scrollbar orientation="horizontal" />
    </ScrollArea>,
  );
  expect(horizontalOnly.orientation).toBe('horizontal');
  expect(horizontalOnly.viewport).toMatch(/overflow-y-hidden/);
  expect(horizontalOnly.bars).toEqual(['horizontal']);

  const bothDeclared = layoutOf(
    <ScrollArea>
      <ScrollArea.Scrollbar orientation="vertical" />
      <Lines />
      <ScrollArea.Scrollbar orientation="horizontal" />
    </ScrollArea>,
  );
  expect(bothDeclared.orientation).toBe('both');
  expect(bothDeclared.bars).toEqual(['vertical', 'horizontal']);

  const verticalDeclaredScrollingBoth = layoutOf(
    <ScrollArea orientation="both">
      <Lines />
      <ScrollArea.Scrollbar orientation="vertical" />
    </ScrollArea>,
  );
  expect(verticalDeclaredScrollingBoth.orientation).toBe('both');
  expect(verticalDeclaredScrollingBoth.bars).toEqual(['vertical', 'horizontal']);
});

test('the native bar takes no width and the thumb is sized by the visible share of the content', async () => {
  await render(
    <ScrollArea variant="always" className="h-40 w-48">
      <Lines />
    </ScrollArea>,
  );
  const view = viewport();
  expect(getComputedStyle(view).scrollbarWidth).toBe('none');
  expect(view.offsetWidth - view.clientWidth).toBe(0);

  await expect.element(thumb()).toBeVisible();
  const track = bar().getBoundingClientRect().height;
  const expected = (track * view.clientHeight) / view.scrollHeight;
  expect(thumb().getBoundingClientRect().height).toBeCloseTo(expected, 0);
});

test('a long content keeps the thumb at the minimum length and the thumb follows the scroll', async () => {
  await render(
    <ScrollArea variant="always" className="h-40 w-48">
      <Lines count={400} />
    </ScrollArea>,
  );
  const view = viewport();
  await expect.element(thumb()).toBeVisible();
  expect(thumb().getBoundingClientRect().height).toBeCloseTo(MIN_THUMB_LENGTH, 0);

  view.scrollTop = view.scrollHeight;
  await expect
    .poll(() => bar().getBoundingClientRect().bottom - thumb().getBoundingClientRect().bottom)
    .toBeCloseTo(0, 0);

  view.scrollTop = 0;
  await expect
    .poll(() => thumb().getBoundingClientRect().top - bar().getBoundingClientRect().top)
    .toBeCloseTo(0, 0);
});

test('the wheel scrolls natively and marks the area as scrolling until it settles', async () => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  const screen = await render(
    <ScrollArea className="h-40 w-48" data-testid="area">
      <Lines />
    </ScrollArea>,
  );
  const area = screen.getByTestId('area');
  await userEvent.wheel(viewport(), { delta: { y: 120 } });
  await expect.poll(() => viewport().scrollTop).toBeGreaterThan(0);
  await expect.element(area).toHaveAttribute('data-scrolling');
  await expect.element(bar()).toHaveAttribute('data-visible');

  vi.advanceTimersByTime(1000);
  await expect.element(area).not.toHaveAttribute('data-scrolling');
});

test('variants: hover shows the bar only while the pointer is over, auto on overflow, always regardless', async () => {
  const screen = await render(
    <div className="flex gap-4">
      <ScrollArea variant="hover" className="h-40 w-40" data-testid="hover">
        <Lines />
      </ScrollArea>
      <ScrollArea variant="auto" className="h-40 w-40" data-testid="auto">
        <Lines />
      </ScrollArea>
      <ScrollArea variant="auto" className="h-40 w-40" data-testid="auto-short">
        <Lines count={2} />
      </ScrollArea>
      <ScrollArea variant="always" className="h-40 w-40" data-testid="always-short">
        <Lines count={2} />
      </ScrollArea>
    </div>,
  );
  const barOf = (id: string) => q('[data-scroll-area-scrollbar]', screen.getByTestId(id).element());

  await expect.element(screen.getByTestId('hover')).toHaveAttribute('data-overflow-y');
  expect(barOf('hover').hasAttribute('data-visible')).toBe(false);
  expect(getComputedStyle(barOf('hover')).pointerEvents).toBe('none');

  await userEvent.hover(screen.getByTestId('hover'));
  await expect.element(screen.getByTestId('hover')).toHaveAttribute('data-hovering');
  await expect.element(barOf('hover')).toHaveAttribute('data-visible');

  await userEvent.unhover(screen.getByTestId('hover'));
  await expect.element(barOf('hover')).not.toHaveAttribute('data-visible');

  await expect.element(barOf('auto')).toHaveAttribute('data-visible');
  expect(barOf('auto-short').hasAttribute('data-visible')).toBe(false);
  expect(screen.getByTestId('auto-short').element().hasAttribute('data-overflow-y')).toBe(false);

  await expect.element(barOf('always-short')).toHaveAttribute('data-visible');
  expect(q('[data-scroll-area-thumb]', barOf('always-short')).hidden).toBe(true);
});

test('dragging the thumb scrolls by the content-to-track ratio and holds the pointer', async (context) => {
  skipWithoutCdp(context);
  const screen = await render(
    <ScrollArea variant="auto" className="h-40 w-48" data-testid="area">
      <Lines count={60} />
    </ScrollArea>,
  );
  await expect.element(thumb()).toBeVisible();
  const view = viewport();
  const track = bar().getBoundingClientRect().height;
  const size = thumb().getBoundingClientRect().height;
  const ratio = (view.scrollHeight - view.clientHeight) / (track - size);

  const start = centerOf(thumb());
  await mouse('mousePressed', start);
  await expect.element(bar()).toHaveAttribute('data-dragging');
  await expect.element(screen.getByTestId('area')).toHaveAttribute('data-dragging');
  await mouse('mouseMoved', { x: start.x + 200, y: start.y + 30 });
  expect(view.scrollTop).toBeCloseTo(30 * ratio, -1);

  await mouse('mouseMoved', { x: start.x, y: start.y + 10_000 });
  expect(view.scrollTop).toBe(view.scrollHeight - view.clientHeight);

  await mouse('mouseReleased', { x: start.x, y: start.y + 10_000 });
  await expect.element(bar()).not.toHaveAttribute('data-dragging');
  expect(document.activeElement).toBe(document.body);
});

test('pressing the track pages toward the pointer', async (context) => {
  skipWithoutCdp(context);
  await render(
    <ScrollArea variant="auto" className="h-40 w-48">
      <Lines count={60} />
    </ScrollArea>,
  );
  await expect.element(thumb()).toBeVisible();
  const view = viewport();
  const page = view.clientHeight * PAGE_FRACTION;
  const track = bar().getBoundingClientRect();

  await mouse('mousePressed', { x: track.left + track.width / 2, y: track.bottom - 2 });
  await mouse('mouseReleased', { x: track.left + track.width / 2, y: track.bottom - 2 });
  await expect.poll(() => view.scrollTop).toBeCloseTo(page, 0);

  await mouse('mousePressed', { x: track.left + track.width / 2, y: track.top + 2 });
  await mouse('mouseReleased', { x: track.left + track.width / 2, y: track.top + 2 });
  await expect.poll(() => view.scrollTop).toBe(0);
});

const FIREFOX_STOPS_ON_EVERY_SCROLLER = server.browser === 'firefox';
const A_SUBPIXEL_SCROLL = 1;

test('a plain text area becomes a tab stop that scrolls by keyboard, a focusable content does not', async () => {
  const screen = await render(
    <>
      <button type="button">앞</button>
      <ScrollArea className="h-40 w-48" data-testid="text">
        <Lines />
      </ScrollArea>
      <ScrollArea className="h-40 w-48" data-testid="short">
        <Lines count={2} />
      </ScrollArea>
      <ScrollArea className="h-40 w-48" data-testid="buttons">
        <button type="button">안</button>
        <Lines />
      </ScrollArea>
    </>,
  );
  const viewportOf = (id: string) =>
    q('[data-scroll-area-viewport]', screen.getByTestId(id).element());

  await expect.element(viewportOf('text')).toHaveAttribute('tabindex', '0');
  expect(viewportOf('short').hasAttribute('tabindex')).toBe(false);
  expect(viewportOf('buttons').hasAttribute('tabindex')).toBe(false);

  await userEvent.click(screen.getByRole('button', { name: '앞' }));
  await userEvent.keyboard('{Tab}');
  expect(document.activeElement).toBe(viewportOf('text'));

  await userEvent.keyboard('{PageDown}');
  await expect.poll(() => viewportOf('text').scrollTop).toBeGreaterThan(0);
  await userEvent.keyboard('{End}');
  await expect
    .poll(() => viewportOf('text').scrollTop)
    .toBeGreaterThanOrEqual(
      viewportOf('text').scrollHeight - viewportOf('text').clientHeight - A_SUBPIXEL_SCROLL,
    );

  await userEvent.keyboard('{Tab}');
  if (FIREFOX_STOPS_ON_EVERY_SCROLLER) {
    expect(document.activeElement).toBe(viewportOf('buttons'));
    await userEvent.keyboard('{Tab}');
  }
  expect(document.activeElement).toBe(screen.getByRole('button', { name: '안' }).element());
});

test('declaration order places a bar: after the content at the default edge, before it opposite', async () => {
  const screen = await render(
    <div className="flex gap-4">
      <ScrollArea variant="always" className="h-40 w-40" data-testid="after">
        <Lines />
        <ScrollArea.Scrollbar />
      </ScrollArea>
      <ScrollArea variant="always" className="h-40 w-40" data-testid="before">
        <ScrollArea.Scrollbar orientation="vertical" />
        <ScrollArea.Scrollbar orientation="horizontal" />
        <div className="w-96">
          <Lines />
        </div>
      </ScrollArea>
    </div>,
  );
  const rectOf = (id: string) => screen.getByTestId(id).element().getBoundingClientRect();
  const barIn = (id: string, orientation: 'vertical' | 'horizontal') =>
    q(
      `[data-scroll-area-scrollbar][data-orientation="${orientation}"]`,
      screen.getByTestId(id).element(),
    );

  await expect.element(barIn('after', 'vertical')).toHaveAttribute('data-placement', 'end');
  expect(rectOf('after').right - barIn('after', 'vertical').getBoundingClientRect().right).toBe(
    GAP,
  );

  await expect.element(barIn('before', 'vertical')).toHaveAttribute('data-placement', 'start');
  expect(barIn('before', 'vertical').getBoundingClientRect().left - rectOf('before').left).toBe(
    GAP,
  );
  expect(barIn('before', 'horizontal').getAttribute('data-placement')).toBe('start');
  expect(barIn('before', 'horizontal').getBoundingClientRect().top - rectOf('before').top).toBe(
    GAP,
  );
  expect(
    screen.getByTestId('before').element().querySelectorAll('[data-scroll-area-scrollbar]'),
  ).toHaveLength(2);
});

test('RTL puts the vertical bar at the left and runs the horizontal thumb from the right', async () => {
  const screen = await render(
    <div dir="rtl">
      <ScrollArea variant="always" orientation="both" className="h-40 w-48" data-testid="area">
        <div className="w-[600px]">
          <Lines />
        </div>
      </ScrollArea>
    </div>,
  );
  const root = screen.getByTestId('area').element().getBoundingClientRect();
  await expect.element(thumb('horizontal')).toBeVisible();
  expect(bar().getBoundingClientRect().left - root.left).toBe(GAP);
  expect(bar('horizontal').getBoundingClientRect().right).toBeLessThan(root.right);
  expect(
    bar('horizontal').getBoundingClientRect().right -
      thumb('horizontal').getBoundingClientRect().right,
  ).toBeCloseTo(0, 0);

  const view = viewport();
  view.scrollLeft = -(view.scrollWidth - view.clientWidth);
  await expect
    .poll(
      () =>
        thumb('horizontal').getBoundingClientRect().left -
        bar('horizontal').getBoundingClientRect().left,
    )
    .toBeCloseTo(0, 0);
});

test('resizing the content or the area keeps the thumb and the overflow in sync', async () => {
  const screen = await render(
    <ScrollArea variant="auto" className="h-40 w-48" data-testid="area">
      <div data-testid="content" style={{ height: 100 }} />
    </ScrollArea>,
  );
  const area = screen.getByTestId('area');
  const content = screen.getByTestId('content').element() as HTMLElement;
  expect(area.element().hasAttribute('data-overflow-y')).toBe(false);

  content.style.height = '320px';
  await expect.element(area).toHaveAttribute('data-overflow-y');
  await expect
    .poll(() => thumb().getBoundingClientRect().height)
    .toBeCloseTo((bar().getBoundingClientRect().height * 160) / 320, 0);

  (area.element() as HTMLElement).style.height = '80px';
  await expect
    .poll(() => thumb().getBoundingClientRect().height)
    .toBeCloseTo(Math.max(MIN_THUMB_LENGTH, (bar().getBoundingClientRect().height * 80) / 320), 0);

  content.style.height = '40px';
  await expect.element(area).not.toHaveAttribute('data-overflow-y');
  await expect.element(bar()).not.toHaveAttribute('data-visible');
});

test('the bar ends stay clear of a rounded corner and keep a gap from the side', async () => {
  const screen = await render(
    <ScrollArea
      variant="always"
      className="h-40 w-48 border border-black"
      style={{ borderRadius: 14 }}
      data-testid="area"
    >
      <Lines />
    </ScrollArea>,
  );
  await expect.element(thumb()).toBeVisible();
  const root = screen.getByTestId('area').element();
  const inner = {
    top: root.getBoundingClientRect().top + 1,
    right: root.getBoundingClientRect().right - 1,
    bottom: root.getBoundingClientRect().bottom - 1,
  };
  const radius = 14 - 1;
  const track = bar().getBoundingClientRect();

  expect(inner.right - track.right).toBe(GAP);
  expect(track.top - inner.top).toBeCloseTo(clearOfCurve(radius, GAP), 1);
  expect(inner.bottom - track.bottom).toBeCloseTo(clearOfCurve(radius, GAP), 1);

  const center = { x: inner.right - radius, y: inner.top + radius };
  const outerTopCorner = { x: track.right, y: track.top };
  expect(Math.hypot(outerTopCorner.x - center.x, outerTopCorner.y - center.y)).toBeLessThan(radius);
});

test('both bars leave the corner to ScrollArea.Corner, which a rounded corner has no room for', async () => {
  const screen = await render(
    <div className="flex gap-4">
      <ScrollArea variant="always" orientation="both" className="h-40 w-40" data-testid="square">
        <div className="h-[400px] w-[400px]" />
      </ScrollArea>
      <ScrollArea
        variant="always"
        orientation="both"
        className="h-40 w-40"
        style={{ borderRadius: 14 }}
        data-testid="round"
      >
        <div className="h-[400px] w-[400px]" />
      </ScrollArea>
    </div>,
  );
  const inside = (id: string, selector: string) => q(selector, screen.getByTestId(id).element());
  const corner = inside('square', '[data-scroll-area-corner]');
  await expect.element(corner).toBeVisible();

  const root = screen.getByTestId('square').element().getBoundingClientRect();
  const square = corner.getBoundingClientRect();
  expect([root.right - square.right, root.bottom - square.bottom]).toEqual([GAP, GAP]);
  expect([square.width, square.height]).toEqual([THICKNESS, THICKNESS]);
  expect(inside('square', '[data-orientation="vertical"]').getBoundingClientRect().bottom).toBe(
    square.top,
  );
  expect(inside('square', '[data-orientation="horizontal"]').getBoundingClientRect().right).toBe(
    square.left,
  );

  await expect.element(inside('round', '[data-scroll-area-corner]')).not.toBeVisible();
  const vertical = inside('round', '[data-orientation="vertical"]').getBoundingClientRect();
  const rounded = screen.getByTestId('round').element().getBoundingClientRect();
  expect(rounded.bottom - vertical.bottom).toBeCloseTo(
    Math.max(clearOfCurve(14, GAP), GAP + THICKNESS),
    1,
  );
});

test('a Corner with content is occupied: shown with one bar, flush in its corner, and the bar stops a gap short of it', async () => {
  const screen = await render(
    <div className="flex gap-4">
      <ScrollArea
        variant="always"
        className="h-40 w-40"
        style={{ borderRadius: 14 }}
        data-testid="round"
      >
        <Lines />
        <ScrollArea.Corner>
          <button type="button" aria-label="크기" className="block size-4" />
        </ScrollArea.Corner>
      </ScrollArea>
      <ScrollArea variant="always" className="h-40 w-40" data-testid="square">
        <Lines />
        <ScrollArea.Corner>
          <span className="block size-4" />
        </ScrollArea.Corner>
      </ScrollArea>
    </div>,
  );
  const inside = (id: string, selector: string) => q(selector, screen.getByTestId(id).element());
  const corner = inside('round', '[data-scroll-area-corner]');
  await expect.element(corner).toBeVisible();
  await expect.element(corner).toHaveAttribute('data-occupied');
  expect(corner.hasAttribute('aria-hidden')).toBe(false);
  await expect.element(screen.getByRole('button', { name: '크기' })).toBeVisible();

  const round = screen.getByTestId('round').element().getBoundingClientRect();
  const box = corner.getBoundingClientRect();
  expect([round.right - box.right, round.bottom - box.bottom]).toEqual([0, 0]);
  expect([box.width, box.height]).toEqual([16, 16]);
  const barBottom = () =>
    inside('round', '[data-orientation="vertical"]').getBoundingClientRect().bottom;
  await expect.poll(() => corner.getBoundingClientRect().top - barBottom()).toBeCloseTo(GAP, 1);

  const square = screen.getByTestId('square').element().getBoundingClientRect();
  const squareCorner = inside('square', '[data-scroll-area-corner]').getBoundingClientRect();
  expect([square.right - squareCorner.right, square.bottom - squareCorner.bottom]).toEqual([0, 0]);
});

test('asChild roots and viewports: a listbox can itself be the scroller', async () => {
  const screen = await render(
    <ScrollArea className="h-40 w-48">
      <ScrollArea.Viewport asChild>
        <div role="listbox" aria-label="과일" tabIndex={-1}>
          {Array.from({ length: 30 }, (_, index) => (
            <div key={index} role="option" aria-selected={false} className="h-6">
              과일 {index}
            </div>
          ))}
        </div>
      </ScrollArea.Viewport>
    </ScrollArea>,
  );
  const listbox = screen.getByRole('listbox').element() as HTMLElement;
  expect(listbox.hasAttribute('data-scroll-area-viewport')).toBe(true);
  expect(listbox.getAttribute('tabindex')).toBe('-1');
  await expect
    .element(listbox.closest<HTMLElement>('[data-scroll-area]'))
    .toHaveAttribute('data-overflow-y');

  const rooted = await render(
    <ScrollArea asChild variant="always">
      <section aria-label="본문" className="h-40 w-48">
        <Lines />
      </section>
    </ScrollArea>,
  );
  const section = rooted.getByRole('region', { name: '본문' }).element();
  expect(section.hasAttribute('data-scroll-area')).toBe(true);
  expect(section.firstElementChild!.hasAttribute('data-scroll-area-viewport')).toBe(true);
  expect(section.firstElementChild!.textContent).toMatch(/^줄 1줄 2/);
});

test('dev warnings: parts outside ScrollArea, two bars for one orientation, mixed content', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  await render(
    <>
      <ScrollArea.Scrollbar />
      <ScrollArea.Thumb />
      <ScrollArea.Corner />
      <ScrollArea className="h-20">
        <ScrollArea.Scrollbar />
        <Lines />
        <ScrollArea.Scrollbar />
      </ScrollArea>
    </>,
  );
  await nextFrame();
  const messages = warn.mock.calls.map(([message]) => String(message));
  expect(messages).toEqual(
    expect.arrayContaining([
      expect.stringMatching(/ScrollArea\.Scrollbar is drawn only inside <ScrollArea>/),
      expect.stringMatching(/ScrollArea\.Thumb is drawn only inside <ScrollArea\.Scrollbar>/),
      expect.stringMatching(/ScrollArea\.Corner is drawn only inside <ScrollArea>/),
      expect.stringMatching(/more than one Scrollbar for the same orientation \(vertical\)/),
    ]),
  );

  expect(() =>
    renderToString(
      <ScrollArea>
        <ScrollArea.Viewport>안</ScrollArea.Viewport>밖
      </ScrollArea>,
    ),
  ).toThrow(/either inside/);
});

const OVERFLOW_EDGES = ['y-start', 'y-end', 'x-start', 'x-end'] as const;

const overflowEdges = (element: Element) => {
  const style = getComputedStyle(element);
  return Object.fromEntries(
    OVERFLOW_EDGES.map((edge) => [
      edge,
      parseFloat(style.getPropertyValue(`--scroll-area-overflow-${edge}`)),
    ]),
  );
};

const markedEdges = (element: Element) =>
  OVERFLOW_EDGES.filter((edge) => element.hasAttribute(`data-overflow-${edge}`));

const fadeLengths = (element: Element) =>
  [
    ...getComputedStyle(element).maskImage.matchAll(/calc\(100% - ([\d.]+)px\)|([\d.]+)px|100%/g),
  ].map(([, fromTheEnd, fromTheStart]) => Number(fromTheEnd ?? fromTheStart ?? 0));

const gradientsIn = (element: Element) =>
  getComputedStyle(element).maskImage.match(/linear-gradient\(/g)?.length ?? 0;

test('overflow edges: the viewport carries how far the content runs past the top and the bottom', async () => {
  await render(
    <ScrollArea className="h-40 w-48">
      <Lines />
    </ScrollArea>,
  );
  const view = viewport();
  const range = view.scrollHeight - view.clientHeight;
  expect(range).toBeGreaterThan(600);

  await expect
    .poll(() => overflowEdges(view))
    .toEqual({ 'y-start': 0, 'y-end': range, 'x-start': 0, 'x-end': 0 });
  expect(markedEdges(view)).toEqual(['y-end']);

  view.scrollTop = 200;
  await expect
    .poll(() => overflowEdges(view))
    .toEqual({ 'y-start': 200, 'y-end': range - 200, 'x-start': 0, 'x-end': 0 });
  expect(markedEdges(view)).toEqual(['y-start', 'y-end']);

  view.scrollTop = range;
  await expect
    .poll(() => overflowEdges(view))
    .toEqual({ 'y-start': range, 'y-end': 0, 'x-start': 0, 'x-end': 0 });
  expect(markedEdges(view)).toEqual(['y-start']);
});

test('overflow edges: the x axis is logical, left to right in LTR and right to left in RTL', async () => {
  const screen = await render(
    <div className="flex flex-col gap-4">
      <ScrollArea orientation="horizontal" className="w-48" data-testid="ltr">
        <div className="h-10 w-[600px]" />
      </ScrollArea>
      <div dir="rtl">
        <ScrollArea orientation="horizontal" className="w-48" data-testid="rtl">
          <div className="h-10 w-[600px]" />
        </ScrollArea>
      </div>
    </div>,
  );
  const viewportOf = (id: string) =>
    q('[data-scroll-area-viewport]', screen.getByTestId(id).element());
  const [ltr, rtl] = [viewportOf('ltr'), viewportOf('rtl')];

  for (const view of [ltr, rtl]) {
    await expect
      .poll(() => overflowEdges(view))
      .toEqual({ 'y-start': 0, 'y-end': 0, 'x-start': 0, 'x-end': 408 });
    expect(markedEdges(view)).toEqual(['x-end']);
  }

  ltr.scrollLeft = 100;
  rtl.scrollLeft = -100;
  for (const view of [ltr, rtl])
    await expect
      .poll(() => overflowEdges(view))
      .toEqual({ 'y-start': 0, 'y-end': 0, 'x-start': 100, 'x-end': 308 });

  ltr.scrollLeft = 408;
  rtl.scrollLeft = -408;
  for (const view of [ltr, rtl]) {
    await expect
      .poll(() => overflowEdges(view))
      .toEqual({ 'y-start': 0, 'y-end': 0, 'x-start': 408, 'x-end': 0 });
    expect(markedEdges(view)).toEqual(['x-start']);
  }
});

test('overflow edges: an axis that does not scroll stays at 0 even when its content is wider', async () => {
  await render(
    <ScrollArea className="h-40 w-48">
      <div className="h-[400px] w-[600px]" />
    </ScrollArea>,
  );
  const view = viewport();
  expect(view.scrollWidth).toBeGreaterThan(view.clientWidth);
  await expect
    .poll(() => overflowEdges(view))
    .toEqual({ 'y-start': 0, 'y-end': 240, 'x-start': 0, 'x-end': 0 });
  expect(markedEdges(view)).toEqual(['y-end']);
});

test('overflow edges: the content does not inherit the distances, so a scroll frame restyles only the viewport', async () => {
  await render(
    <ScrollArea className="h-40 w-48">
      <p data-testid="line">줄</p>
      <Lines />
    </ScrollArea>,
  );
  const view = viewport();
  await expect.poll(() => overflowEdges(view)['y-end']).toBeGreaterThan(0);

  const line = q('[data-testid="line"]');
  expect(getComputedStyle(line).getPropertyValue('--scroll-area-overflow-y-end')).toBe('0px');
});

test('fade: the mask goes only on the axes asked for that also scroll, and never on the bars', async () => {
  const screen = await render(
    <div className="flex flex-wrap gap-2">
      <ScrollArea orientation="both" className="size-32" data-testid="off">
        <div className="size-[400px]" />
      </ScrollArea>
      <ScrollArea fade="y" orientation="both" className="size-32" data-testid="y">
        <div className="size-[400px]" />
      </ScrollArea>
      <ScrollArea fade="x" orientation="both" className="size-32" data-testid="x">
        <div className="size-[400px]" />
      </ScrollArea>
      <ScrollArea fade orientation="both" className="size-32" data-testid="both">
        <div className="size-[400px]" />
      </ScrollArea>
      <ScrollArea fade className="size-32" data-testid="vertical">
        <div className="size-[400px]" />
      </ScrollArea>
      <ScrollArea fade="x" className="size-32" data-testid="x-on-vertical">
        <div className="size-[400px]" />
      </ScrollArea>
    </div>,
  );
  const viewportOf = (id: string) =>
    q('[data-scroll-area-viewport]', screen.getByTestId(id).element());

  expect(getComputedStyle(viewportOf('off')).maskImage).toBe('none');
  expect(getComputedStyle(viewportOf('x-on-vertical')).maskImage).toBe('none');

  expect(gradientsIn(viewportOf('y'))).toBe(1);
  expect(getComputedStyle(viewportOf('y')).maskImage).not.toMatch(/to (right|left)/);
  expect(gradientsIn(viewportOf('vertical'))).toBe(1);
  expect(getComputedStyle(viewportOf('vertical')).maskImage).not.toMatch(/to (right|left)/);

  expect(gradientsIn(viewportOf('x'))).toBe(1);
  expect(getComputedStyle(viewportOf('x')).maskImage).toMatch(/to right/);

  expect(gradientsIn(viewportOf('both'))).toBe(2);
  expect(getComputedStyle(viewportOf('both')).maskComposite).toMatch(/intersect/);

  const both = screen.getByTestId('both').element();
  for (const part of both.querySelectorAll(
    '[data-scroll-area-scrollbar], [data-scroll-area-thumb], [data-scroll-area-corner]',
  )) {
    expect(part.closest('[data-scroll-area-viewport]')).toBeNull();
    expect(getComputedStyle(part).maskImage).toBe('none');
  }
  expect(getComputedStyle(both).maskImage).toBe('none');
});

test('fade: each edge fades by the distance hidden past it, up to the fade size', async () => {
  const screen = await render(
    <div className="flex gap-4">
      <ScrollArea fade className="h-40 w-48" data-testid="standard">
        <Lines />
      </ScrollArea>
      <ScrollArea fade size="tiny" className="h-40 w-48" data-testid="tiny">
        <Lines />
      </ScrollArea>
      <ScrollArea fade className="h-40 w-48 [--scroll-area-fade-size:40px]" data-testid="custom">
        <Lines />
      </ScrollArea>
    </div>,
  );
  const viewportOf = (id: string) =>
    q('[data-scroll-area-viewport]', screen.getByTestId(id).element());
  const views = ['standard', 'tiny', 'custom'].map(viewportOf);

  await expect
    .poll(() => views.map(fadeLengths))
    .toEqual([
      [0, 24],
      [0, 16],
      [0, 40],
    ]);

  for (const view of views) view.scrollTop = 10;
  await expect
    .poll(() => views.map(fadeLengths))
    .toEqual([
      [10, 24],
      [10, 16],
      [10, 40],
    ]);

  for (const view of views) view.scrollTop = 100;
  await expect
    .poll(() => views.map(fadeLengths))
    .toEqual([
      [24, 24],
      [16, 16],
      [40, 40],
    ]);

  for (const view of views) view.scrollTop = view.scrollHeight - view.clientHeight - 6;
  await expect
    .poll(() => views.map(fadeLengths))
    .toEqual([
      [24, 6],
      [16, 6],
      [40, 6],
    ]);
});

test('fade: in RTL the x gradient runs from the right, where the start is', async () => {
  const screen = await render(
    <div dir="rtl">
      <ScrollArea fade orientation="horizontal" className="w-48" data-testid="area">
        <div className="h-10 w-[600px]" />
      </ScrollArea>
    </div>,
  );
  const view = q('[data-scroll-area-viewport]', screen.getByTestId('area').element());
  expect(getComputedStyle(view).maskImage).toMatch(/to left/);
  await expect.poll(() => fadeLengths(view)).toEqual([0, 24]);

  view.scrollLeft = -10;
  await expect.poll(() => fadeLengths(view)).toEqual([10, 24]);

  view.scrollLeft = -(view.scrollWidth - view.clientWidth);
  await expect.poll(() => fadeLengths(view)).toEqual([24, 0]);
});

test('fade: what the browser scrolls into view stops a fade size away from the faded edges', async () => {
  const screen = await render(
    <div className="flex gap-4">
      <ScrollArea fade className="h-40 w-48" data-testid="y">
        {Array.from({ length: 20 }, (_, index) => (
          <div key={index} data-row={index + 1} className="h-8" />
        ))}
      </ScrollArea>
      <ScrollArea fade size="tiny" orientation="horizontal" className="w-48" data-testid="x">
        <div className="flex w-max">
          {Array.from({ length: 20 }, (_, index) => (
            <div key={index} data-column={index + 1} className="h-8 w-16 shrink-0" />
          ))}
        </div>
      </ScrollArea>
      <ScrollArea className="h-40 w-48" data-testid="off">
        <Lines />
      </ScrollArea>
    </div>,
  );
  const viewportOf = (id: string) =>
    q('[data-scroll-area-viewport]', screen.getByTestId(id).element());
  const [y, x] = [viewportOf('y'), viewportOf('x')];

  const row = q('[data-row="10"]', y);
  row.scrollIntoView({ block: 'nearest' });
  await expect
    .poll(() => y.getBoundingClientRect().bottom - row.getBoundingClientRect().bottom)
    .toBeCloseTo(24, 0);

  const column = q('[data-column="10"]', x);
  column.scrollIntoView({ inline: 'nearest' });
  await expect
    .poll(() => x.getBoundingClientRect().right - column.getBoundingClientRect().right)
    .toBeCloseTo(16, 0);

  expect(getComputedStyle(viewportOf('off')).scrollPaddingTop).toBe('auto');
});

test('fade: a tab-stop viewport drops the mask while its focus ring shows, since the mask would cut it', async () => {
  const screen = await render(
    <>
      <button type="button">앞</button>
      <ScrollArea fade className="h-40 w-48">
        <Lines />
      </ScrollArea>
    </>,
  );
  const view = viewport();
  await expect.element(view).toHaveAttribute('tabindex', '0');
  expect(gradientsIn(view)).toBe(1);

  await userEvent.click(screen.getByRole('button', { name: '앞' }));
  await userEvent.keyboard('{Tab}');
  expect(document.activeElement).toBe(view);
  expect(getComputedStyle(view).maskImage).toBe('none');
  expect(getComputedStyle(view).boxShadow).not.toBe('none');

  await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
  expect(gradientsIn(view)).toBe(1);
});

test('fade: a textarea viewport fades the lines typed past its top', async () => {
  const screen = await render(
    <ScrollArea fade className="h-24 w-48">
      <ScrollArea.Viewport asChild>
        <textarea aria-label="메모" className="resize-none leading-5" />
      </ScrollArea.Viewport>
    </ScrollArea>,
  );
  const textarea = screen.getByRole('textbox', { name: '메모' });
  const input = textarea.element() as HTMLTextAreaElement;
  expect(markedEdges(input)).toEqual([]);

  await userEvent.click(textarea);
  await userEvent.keyboard('1{Enter}2{Enter}3{Enter}4{Enter}5{Enter}6{Enter}7{Enter}8');
  await expect.poll(() => markedEdges(input)).toContain('y-start');
  await expect.poll(() => fadeLengths(input)[0]).toBe(24);

  input.scrollTop = 0;
  await expect.poll(() => markedEdges(input)).toEqual(['y-end']);
  expect(fadeLengths(input)).toEqual([0, 24]);
});

test('fade SSR: the server HTML carries the mask but no distances, so nothing is faded before measuring', () => {
  const doc = new DOMParser().parseFromString(
    renderToString(
      <ScrollArea fade orientation="both" className="h-40">
        <Lines />
      </ScrollArea>,
    ),
    'text/html',
  );
  const view = doc.querySelector('[data-scroll-area-viewport]')!;
  expect(view.className).toMatch(/mask-image/);
  expect(view.hasAttribute('style')).toBe(false);
  expect(OVERFLOW_EDGES.filter((edge) => view.hasAttribute(`data-overflow-${edge}`))).toEqual([]);
  expect(doc.querySelector('[data-scroll-area]')!.className).toMatch(
    /\[--scroll-area-fade-size:24px\]/,
  );
});

test('fade hydration: the first client render matches the server, then the distances arrive', async () => {
  const area = (
    <ScrollArea fade className="h-40 w-48">
      <Lines />
    </ScrollArea>
  );
  const host = document.createElement('div');
  host.innerHTML = renderToString(area);
  document.body.append(host);
  const view = q('[data-scroll-area-viewport]', host);
  expect(markedEdges(view)).toEqual([]);

  const errors = vi.spyOn(console, 'error');
  const recoverable: unknown[] = [];
  const root = hydrateRoot(host, area, {
    onRecoverableError: (error) => recoverable.push(error),
  });
  onTestFinished(() => {
    root.unmount();
    host.remove();
  });

  await expect.poll(() => markedEdges(view)).toEqual(['y-end']);
  expect(q('[data-scroll-area-viewport]', host)).toBe(view);
  expect(recoverable).toEqual([]);
  expect(errors.mock.calls).toEqual([]);
});

test('adopted: a Select listbox is its own viewport inside the popup, both clear of the 14px corner', async () => {
  const screen = await render(
    <IdsProvider>
      <Select aria-label="도시" defaultValue="도시 20">
        {Array.from({ length: 40 }, (_, index) => (
          <Select.Item key={index} value={`도시 ${index + 1}`}>
            도시 {index + 1}
          </Select.Item>
        ))}
      </Select>
    </IdsProvider>,
  );
  await userEvent.click(screen.getByRole('combobox', { name: '도시' }));
  const listbox = screen.getByRole('listbox').element() as HTMLElement;
  const popup = listbox.closest<HTMLElement>('[data-field-popup]')!;

  expect(listbox.hasAttribute('data-scroll-area-viewport')).toBe(true);
  expect(popup.hasAttribute('data-scroll-area')).toBe(true);
  expect(getComputedStyle(popup).borderTopRightRadius).toBe('14px');
  expect(getComputedStyle(popup).paddingTop).toBe('0px');
  expect(listbox.hasAttribute('tabindex')).toBe(false);

  const area = listbox.closest<HTMLElement>('[data-scroll-area]')!;
  await expect.element(area).toHaveAttribute('data-overflow-y');
  await userEvent.hover(screen.getByRole('option', { name: '도시 20' }));
  const listBar = q('[data-scroll-area-scrollbar]', area);
  await expect.element(listBar).toHaveAttribute('data-visible');

  const box = popup.getBoundingClientRect();
  const radius = 13;
  const center = { x: box.right - 1 - radius, y: box.bottom - 1 - radius };
  const track = listBar.getBoundingClientRect();
  expect(
    Math.hypot(track.right - center.x, Math.max(track.bottom, center.y) - center.y),
  ).toBeLessThan(radius);
});

test('adopted: Menu content scrolls in its viewport and keeps its padding', async () => {
  const screen = await render(
    <IdsProvider>
      <Menu>
        <Menu.Trigger>열기</Menu.Trigger>
        <Menu.Content style={{ maxHeight: 160 }}>
          {Array.from({ length: 20 }, (_, index) => (
            <Menu.Item key={index}>항목 {index + 1}</Menu.Item>
          ))}
        </Menu.Content>
      </Menu>
    </IdsProvider>,
  );
  await userEvent.click(screen.getByRole('button', { name: '열기' }));
  const menu = screen.getByRole('menu').element() as HTMLElement;
  const viewportOfMenu = q('[data-scroll-area-viewport]', menu);

  expect(menu.hasAttribute('data-scroll-area')).toBe(true);
  expect(getComputedStyle(viewportOfMenu).paddingTop).toBe('4px');
  await expect.element(menu).toHaveAttribute('data-overflow-y');
  expect(viewportOfMenu.hasAttribute('tabindex')).toBe(false);

  await userEvent.keyboard('{End}');
  await expect.element(screen.getByRole('menuitem', { name: '항목 20' })).toHaveFocus();
  const last = screen.getByRole('menuitem', { name: '항목 20' }).element().getBoundingClientRect();
  expect(viewportOfMenu.scrollTop).toBeGreaterThan(0);
  expect(last.bottom).toBeLessThanOrEqual(viewportOfMenu.getBoundingClientRect().bottom);
});

const fadesOnlyTopAndBottom = (element: Element) =>
  gradientsIn(element) === 1 && !/to (left|right)/.test(getComputedStyle(element).maskImage);

const LIST_FADE = 24;

test('adopted: popup lists and the field popup fade only their top and bottom', async () => {
  const cities = Array.from({ length: 30 }, (_, index) => (
    <Select.Item key={index} value={`도시 ${index + 1}`}>
      도시 {index + 1}
    </Select.Item>
  ));
  const screen = await render(
    <IdsProvider>
      <Select aria-label="도시">{cities}</Select>
      <Menu>
        <Menu.Trigger>열기</Menu.Trigger>
        <Menu.Content style={{ maxHeight: 160 }}>
          {Array.from({ length: 20 }, (_, index) => (
            <Menu.Item key={index}>항목 {index + 1}</Menu.Item>
          ))}
        </Menu.Content>
      </Menu>
      <ChipField aria-label="기술">
        {Array.from({ length: 30 }, (_, index) => (
          <ChipField.Item key={index} value={`기술 ${index + 1}`}>
            기술 {index + 1}
          </ChipField.Item>
        ))}
      </ChipField>
    </IdsProvider>,
  );

  await userEvent.click(screen.getByRole('combobox', { name: '도시' }));
  const listbox = screen.getByRole('listbox').element();
  const popup = listbox.closest<HTMLElement>('[data-field-popup]')!;
  expect(fadesOnlyTopAndBottom(listbox)).toBe(true);
  expect(fadesOnlyTopAndBottom(q('[data-scroll-area-viewport]', popup))).toBe(true);
  await userEvent.keyboard('{Escape}');

  await userEvent.click(screen.getByRole('button', { name: '열기' }));
  const menu = screen.getByRole('menu').element();
  expect(fadesOnlyTopAndBottom(q('[data-scroll-area-viewport]', menu))).toBe(true);
  await userEvent.keyboard('{Escape}');

  await userEvent.click(screen.getByRole('combobox', { name: '기술' }));
  await expect.element(screen.getByRole('listbox')).toBeVisible();
  expect(fadesOnlyTopAndBottom(screen.getByRole('listbox').element())).toBe(true);
});

test('adopted: the command palette list fades only its top and bottom', async () => {
  const screen = await render(
    <IdsProvider>
      <Menu triggerType="command" defaultOpen>
        <Menu.Content>
          <Menu.Search data-1p-ignore data-lpignore="true" />
          {Array.from({ length: 30 }, (_, index) => (
            <Menu.Item key={index}>명령 {index + 1}</Menu.Item>
          ))}
        </Menu.Content>
      </Menu>
    </IdsProvider>,
  );
  const list = screen.getByRole('listbox').element();
  expect(list.hasAttribute('data-scroll-area-viewport')).toBe(true);
  expect(fadesOnlyTopAndBottom(list)).toBe(true);
});

test('adopted: arrowing through a Select list stops the highlighted option clear of the fade', async () => {
  const screen = await render(
    <IdsProvider>
      <Select aria-label="도시" defaultValue="도시 1">
        {Array.from({ length: 40 }, (_, index) => (
          <Select.Item key={index} value={`도시 ${index + 1}`}>
            도시 {index + 1}
          </Select.Item>
        ))}
      </Select>
    </IdsProvider>,
  );
  const trigger = screen.getByRole('combobox', { name: '도시' });
  await userEvent.click(trigger);
  const list = screen.getByRole('listbox').element() as HTMLElement;
  const highlighted = () =>
    document.getElementById(trigger.element().getAttribute('aria-activedescendant')!)!;

  for (let step = 0; step < 12; step++) await userEvent.keyboard('{ArrowDown}');
  await expect.poll(() => list.scrollTop).toBeGreaterThan(0);
  expect(markedEdges(list)).toEqual(['y-start', 'y-end']);
  expect(
    list.getBoundingClientRect().bottom - highlighted().getBoundingClientRect().bottom,
  ).toBeCloseTo(LIST_FADE, 0);

  for (let step = 0; step < 6; step++) await userEvent.keyboard('{ArrowUp}');
  expect(
    highlighted().getBoundingClientRect().top - list.getBoundingClientRect().top,
  ).toBeGreaterThanOrEqual(LIST_FADE - 1);
});

test('adopted: arrowing through a Menu stops the highlighted item clear of the fade', async () => {
  const screen = await render(
    <IdsProvider>
      <Menu>
        <Menu.Trigger>열기</Menu.Trigger>
        <Menu.Content style={{ maxHeight: 160 }}>
          {Array.from({ length: 20 }, (_, index) => (
            <Menu.Item key={index}>항목 {index + 1}</Menu.Item>
          ))}
        </Menu.Content>
      </Menu>
    </IdsProvider>,
  );
  await userEvent.click(screen.getByRole('button', { name: '열기' }));
  const menu = screen.getByRole('menu').element() as HTMLElement;
  const view = q('[data-scroll-area-viewport]', menu);

  for (let step = 0; step < 8; step++) await userEvent.keyboard('{ArrowDown}');
  const focused = document.activeElement!;
  expect(focused.getAttribute('role')).toBe('menuitem');
  await expect.poll(() => view.scrollTop).toBeGreaterThan(0);
  expect(view.getBoundingClientRect().bottom - focused.getBoundingClientRect().bottom).toBeCloseTo(
    LIST_FADE,
    0,
  );
});

test('adopted: dragging the scrollbar of a Drawer body scrolls it instead of moving the sheet', async (context) => {
  skipWithoutCdp(context);
  const screen = await render(
    <IdsProvider>
      <Drawer side="bottom" defaultOpen>
        <Drawer.Content aria-label="필터">
          <div className="h-[2000px] shrink-0" />
        </Drawer.Content>
      </Drawer>
    </IdsProvider>,
  );
  const sheet = screen.getByRole('dialog', { name: '필터' }).element() as HTMLElement;
  const body = q('[data-scroll-area-viewport]', sheet);
  await expect.element(sheet).toHaveAttribute('data-overflow-y');

  await mouse('mouseMoved', centerOf(body));
  const drawerBar = q('[data-scroll-area-scrollbar]', sheet);
  await expect.element(drawerBar).toHaveAttribute('data-visible');

  const start = centerOf(q('[data-scroll-area-thumb]', drawerBar));
  await mouse('mousePressed', start);
  await mouse('mouseMoved', { x: start.x, y: start.y + 20 });
  await mouse('mouseMoved', { x: start.x, y: start.y + 60 });
  await mouse('mouseReleased', { x: start.x, y: start.y + 60 });

  expect(sheet.style.transform).toBe('');
  expect(body.scrollTop).toBeGreaterThan(0);
  await expect.element(sheet).toBeVisible();
});

test('adopted: a TextArea past its max rows scrolls the textarea itself under an IDS bar', async () => {
  const screen = await render(<TextArea aria-label="메모" maxRows={3} />);
  const textarea = screen.getByRole('textbox', { name: '메모' });
  const input = textarea.element() as HTMLTextAreaElement;
  const area = input.closest<HTMLElement>('[data-scroll-area]')!;

  expect(input.hasAttribute('data-scroll-area-viewport')).toBe(true);
  expect(getComputedStyle(input).scrollbarWidth).toBe('none');
  expect(area.hasAttribute('data-overflow-y')).toBe(false);

  await userEvent.click(textarea);
  await userEvent.keyboard('1{Enter}2{Enter}3{Enter}4{Enter}5{Enter}6');

  await expect.element(area).toHaveAttribute('data-overflow-y');
  await expect.element(q('[data-scroll-area-scrollbar]', area)).toHaveAttribute('data-visible');
  expect(input.scrollTop).toBeGreaterThan(0);
  expect(input.hasAttribute('tabindex')).toBe(false);
  expect(input.hasAttribute('data-tab-stop')).toBe(false);
});

test('adopted: a TextArea keeps its rounded corner only where no bar sits above or below', async () => {
  const screen = await render(
    <div className="flex flex-col gap-4">
      <TextArea aria-label="단독" />
      <TextArea aria-label="막대">
        <span>위</span>
        <TextArea.Input />
      </TextArea>
    </div>,
  );
  const areaOf = (name: string) =>
    screen.getByRole('textbox', { name }).element().closest<HTMLElement>('[data-scroll-area]')!;

  expect(getComputedStyle(areaOf('단독')).borderTopLeftRadius).not.toBe('0px');
  expect(getComputedStyle(areaOf('단독')).borderBottomLeftRadius).not.toBe('0px');
  expect(getComputedStyle(areaOf('막대')).borderTopLeftRadius).toBe('0px');
  expect(getComputedStyle(areaOf('막대')).borderBottomLeftRadius).not.toBe('0px');
});

test('adopted: a TimePicker column is its own tiny viewport and still centers the picked time', async () => {
  const screen = await render(
    <TimePicker defaultValue={new Time(9)} hourCycle="24h" precision="hour" />,
  );
  const column = screen.getByRole('listbox').element() as HTMLElement;
  const area = column.closest<HTMLElement>('[data-scroll-area]')!;

  expect(column.hasAttribute('data-scroll-area-viewport')).toBe(true);
  expect(area.getAttribute('data-size')).toBe('tiny');
  expect(getComputedStyle(column).scrollbarWidth).toBe('none');
  await expect.element(area).toHaveAttribute('data-overflow-y');

  await userEvent.hover(column);
  await expect.element(q('[data-scroll-area-scrollbar]', area)).toHaveAttribute('data-visible');
  expect(column.getAttribute('tabindex')).toBe('0');
});

const TINY_FADE = 16;

test('adopted: a TimePicker column fades its top and bottom and keeps the centred time whole', async () => {
  const screen = await render(
    <>
      <button type="button">앞</button>
      <TimePicker defaultValue={new Time(9)} hourCycle="24h" precision="hour" />
    </>,
  );
  const column = screen.getByRole('listbox').element() as HTMLElement;
  expect(fadesOnlyTopAndBottom(column)).toBe(true);
  await expect.poll(() => fadeLengths(column)).toEqual([TINY_FADE, TINY_FADE]);

  const box = column.getBoundingClientRect();
  const picked = q('[aria-selected="true"]', column).getBoundingClientRect();
  expect(picked.top - box.top).toBeGreaterThan(TINY_FADE);
  expect(box.bottom - picked.bottom).toBeGreaterThan(TINY_FADE);

  await userEvent.click(screen.getByRole('button', { name: '앞' }));
  await userEvent.keyboard('{Tab}');
  expect(document.activeElement).toBe(column);
  expect(getComputedStyle(column).maskImage).toBe('none');
  expect(getComputedStyle(column).boxShadow).not.toBe('none');
});

test('adopted: a Table fades only its left and right, so its sticky header never fades', async () => {
  const columns = Array.from({ length: 8 }, (_, index) => `열 ${index + 1}`);
  const screen = await render(
    <Table stickyHeader className="max-h-40 w-72">
      <Table.Header>
        <Table.Row>
          {columns.map((column) => (
            <Table.Head key={column} className="min-w-28">
              {column}
            </Table.Head>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {Array.from({ length: 20 }, (_, row) => (
          <Table.Row key={row}>
            {columns.map((column) => (
              <Table.Cell key={column}>
                {row + 1}행 {column}
              </Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>,
  );
  const view = q('[data-scroll-area-viewport]', screen.container);
  await expect.poll(() => markedEdges(view)).toEqual(['y-end', 'x-end']);
  expect(gradientsIn(view)).toBe(1);
  expect(getComputedStyle(view).maskImage).toMatch(/to right/);
  await expect.poll(() => fadeLengths(view)).toEqual([0, LIST_FADE]);

  view.scrollTop = 80;
  view.scrollLeft = 80;
  await expect.poll(() => markedEdges(view)).toEqual(['y-start', 'y-end', 'x-start', 'x-end']);
  expect(gradientsIn(view)).toBe(1);
  expect(fadeLengths(view)).toEqual([LIST_FADE, LIST_FADE]);
});

test('adopted: a long Popover scrolls inside while its arrow still sticks out', async () => {
  const screen = await render(
    <IdsProvider>
      <Popover defaultOpen>
        <Popover.Trigger>열기</Popover.Trigger>
        <Popover.Content aria-label="안내" style={{ maxHeight: 160 }}>
          <Popover.Arrow />
          <div className="h-[600px] shrink-0" />
        </Popover.Content>
      </Popover>
    </IdsProvider>,
  );
  const content = screen.getByRole('dialog', { name: '안내' }).element() as HTMLElement;
  const area = q('[data-scroll-area]', content);
  const arrow = q<SVGElement>('[data-popover-arrow]', content);

  await expect.element(area).toHaveAttribute('data-overflow-y');
  expect(arrow.closest('[data-scroll-area]')).toBeNull();
  expect(getComputedStyle(q('[data-scroll-area-viewport]', area)).paddingTop).toBe('12px');

  const box = content.getBoundingClientRect();
  const tip = arrow.getBoundingClientRect();
  expect(tip.bottom <= box.top + 1 || tip.top >= box.bottom - 1).toBe(true);
});
