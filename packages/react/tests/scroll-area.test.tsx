import { type ReactElement } from 'react';

import { renderToString } from 'react-dom/server';
import { afterEach, expect, test, vi } from 'vitest';
import { cdp, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Drawer, IdsProvider, Menu, ScrollArea, Select } from '../src';
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

test('dragging the thumb scrolls by the content-to-track ratio and holds the pointer', async () => {
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

test('pressing the track pages toward the pointer', async () => {
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
    .toBe(viewportOf('text').scrollHeight - viewportOf('text').clientHeight);

  await userEvent.keyboard('{Tab}');
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

test('adopted: dragging the scrollbar of a Drawer body scrolls it instead of moving the sheet', async () => {
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
