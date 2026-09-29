import { type ReactNode } from 'react';

import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, onTestFinished, test, vi } from 'vitest';
import { cdp, page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Button, FloatingButton, IdsProvider, Select, overlay } from '../src';
import { Drawer } from '../src/components/overlay/drawer';
import {
  DRAG_THRESHOLD,
  latchAxis,
  presenceAt,
  releaseTarget,
  resistedOffset,
  rubberBand,
  snapOffsets,
  translateAlong,
  velocityOf,
} from '../src/components/overlay/drawer/drawer-gesture';

type Point = { x: number; y: number };

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

async function touch(type: 'touchStart' | 'touchMove' | 'touchEnd' | 'touchCancel', point?: Point) {
  await cdp().send('Input.dispatchTouchEvent', {
    type,
    touchPoints: point ? [frameOffset(point)] : [],
  });
}

async function mouseDrag(
  from: Point,
  path: Point[],
  options: { pauseBeforeRelease?: boolean } = {},
) {
  await mouse('mousePressed', from);
  for (const point of path) await mouse('mouseMoved', point);
  if (options.pauseBeforeRelease) await new Promise((resolve) => setTimeout(resolve, 150));
  await mouse('mouseReleased', path.at(-1) ?? from);
}

const down = (from: Point, ...distances: number[]) =>
  distances.map((distance) => ({ x: from.x, y: from.y + distance }));

const sheetOf = () => document.querySelector<HTMLElement>('[data-drawer-content]')!;

const translateY = (element: HTMLElement) => {
  const match = /translate3d\(0px, (-?[\d.]+)px, 0px\)/.exec(element.style.transform);
  return match ? Number(match[1]) : 0;
};

const pointIn = (element: HTMLElement, fromTop = 12): Point => {
  const rect = element.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + fromTop };
};

afterEach(() => {
  document.getSelection()?.removeAllRanges();
});

describe('gesture math', () => {
  test('a pointer latches onto the drawer axis only after the threshold', () => {
    expect(latchAxis('bottom', { x: 3, y: DRAG_THRESHOLD - 1 })).toBe('pending');
    expect(latchAxis('bottom', { x: 2, y: 12 })).toBe('drag');
    expect(latchAxis('bottom', { x: 12, y: 2 })).toBe('cross-axis');
    expect(latchAxis('right', { x: -12, y: 4 })).toBe('drag');
    expect(latchAxis('left', { x: 1, y: 11 })).toBe('cross-axis');
  });

  test('past the open position the drawer follows a logarithmic rubber band', () => {
    expect(rubberBand(5)).toBe(0);
    expect(rubberBand(100)).toBeCloseTo(8 * (Math.log(101) - 2));
    expect(resistedOffset(-100, 0, 500)).toBeCloseTo(-rubberBand(100));
    expect(resistedOffset(120, 0, 500)).toBe(120);
    expect(resistedOffset(900, 0, 500)).toBe(500);
    expect(resistedOffset(200, 300, 800)).toBeCloseTo(300 - rubberBand(100));
  });

  test('velocity reads only the last 100ms of samples', () => {
    expect(velocityOf([])).toBe(0);
    expect(
      velocityOf([
        { time: 0, position: 0 },
        { time: 400, position: 10 },
        { time: 450, position: 60 },
        { time: 500, position: 110 },
      ]),
    ).toBeCloseTo(1);
    expect(
      velocityOf([
        { time: 0, position: 0 },
        { time: 50, position: 80 },
        { time: 300, position: 80 },
      ]),
    ).toBe(0);
  });

  test('release closes on a flick or a quarter of the size, otherwise rests', () => {
    const base = { size: 400, viewport: 800, dismissible: true };
    expect(releaseTarget({ ...base, displacement: 30, velocity: 0.5 })).toEqual({ type: 'close' });
    expect(releaseTarget({ ...base, displacement: 100, velocity: 0 })).toEqual({ type: 'close' });
    expect(releaseTarget({ ...base, displacement: 99, velocity: 0.3 })).toEqual({
      type: 'rest',
      index: null,
    });
    expect(releaseTarget({ ...base, displacement: -50, velocity: -3 })).toEqual({
      type: 'rest',
      index: null,
    });
    expect(releaseTarget({ ...base, dismissible: false, displacement: 300, velocity: 3 })).toEqual({
      type: 'rest',
      index: null,
    });
  });

  test('snap points turn into offsets and a release picks one by position and velocity', () => {
    const offsets = snapOffsets([0.25, '400px', 1], 800, 800);
    expect(offsets).toEqual([600, 400, 0]);
    const base = { size: 800, viewport: 800, dismissible: true };
    const at = (index: number) => ({ offsets, index });
    expect(releaseTarget({ ...base, snap: at(0), displacement: -120, velocity: 0 })).toEqual({
      type: 'rest',
      index: 1,
    });
    expect(releaseTarget({ ...base, snap: at(0), displacement: -60, velocity: 0 })).toEqual({
      type: 'rest',
      index: 0,
    });
    expect(releaseTarget({ ...base, snap: at(0), displacement: -40, velocity: -0.8 })).toEqual({
      type: 'rest',
      index: 1,
    });
    expect(releaseTarget({ ...base, snap: at(1), displacement: 40, velocity: 0.8 })).toEqual({
      type: 'rest',
      index: 0,
    });
    expect(releaseTarget({ ...base, snap: at(0), displacement: 30, velocity: 0.8 })).toEqual({
      type: 'close',
    });
    expect(releaseTarget({ ...base, snap: at(0), displacement: -80, velocity: -2.5 })).toEqual({
      type: 'rest',
      index: 2,
    });
    expect(releaseTarget({ ...base, snap: at(1), displacement: 50, velocity: 2.5 })).toEqual({
      type: 'close',
    });
    expect(releaseTarget({ ...base, snap: at(0), displacement: 150, velocity: 0 })).toEqual({
      type: 'close',
    });
    expect(
      releaseTarget({ ...base, dismissible: false, snap: at(0), displacement: 150, velocity: 0 }),
    ).toEqual({ type: 'rest', index: 0 });
  });

  test('presence fades the backdrop only from fadeFromIndex', () => {
    const snap = { offsets: [600, 400, 0], fadeFromIndex: 2 };
    expect(presenceAt(600, { size: 800, snap })).toBe(0);
    expect(presenceAt(400, { size: 800, snap })).toBe(0);
    expect(presenceAt(200, { size: 800, snap })).toBeCloseTo(0.5);
    expect(presenceAt(0, { size: 800, snap })).toBe(1);
    expect(presenceAt(700, { size: 800, snap: { ...snap, fadeFromIndex: 0 } })).toBeCloseTo(0.5);
    expect(presenceAt(100, { size: 400 })).toBeCloseTo(0.75);
  });

  test('offsets move the drawer toward its own edge', () => {
    expect(translateAlong('bottom', 20)).toBe('translate3d(0, 20px, 0)');
    expect(translateAlong('top', 20)).toBe('translate3d(0, -20px, 0)');
    expect(translateAlong('right', 20)).toBe('translate3d(20px, 0, 0)');
    expect(translateAlong('left', 20)).toBe('translate3d(-20px, 0, 0)');
  });
});

function Sheet({ children, ...props }: Partial<Drawer.Props> & { children?: ReactNode }) {
  return (
    <Drawer {...props}>
      <Drawer.Trigger>Open filters</Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Handle />
        <Drawer.Header>
          <Drawer.Title>Filters</Drawer.Title>
          <Drawer.Description>Narrow the list down.</Drawer.Description>
        </Drawer.Header>
        <input aria-label="Keyword" data-1p-ignore data-lpignore="true" />
        {children}
        <Drawer.Footer>
          <Drawer.Close>Cancel</Drawer.Close>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
}

const TallBody = () => <div className="h-[400px] shrink-0" data-testid="body" />;

test('SSR renders only the trigger', () => {
  const html = renderToString(<Sheet />);
  expect(html).toContain('Open filters');
  expect(html).not.toContain('Filters</h2>');
});

test('opening focuses the first field on the right edge, Tab stays inside, Escape closes and returns focus', async () => {
  const onOpenChange = vi.fn();
  const screen = await render(
    <IdsProvider>
      <Sheet onOpenChange={onOpenChange} />
    </IdsProvider>,
  );
  const trigger = screen.getByRole('button', { name: 'Open filters' });
  await userEvent.click(trigger);
  const drawer = screen.getByRole('dialog', { name: 'Filters' });
  await expect.element(drawer).toHaveAttribute('aria-modal', 'true');
  await expect.element(drawer).toHaveAttribute('data-side', 'right');
  await expect.element(drawer).toHaveAccessibleDescription('Narrow the list down.');
  await expect.element(screen.getByRole('textbox', { name: 'Keyword' })).toHaveFocus();
  const rect = drawer.element().getBoundingClientRect();
  expect(rect.right).toBeCloseTo(window.innerWidth, 0);
  expect(rect.height).toBeCloseTo(window.innerHeight, 0);
  expect(getComputedStyle(drawer.element()).borderTopRightRadius).toBe('0px');
  expect(getComputedStyle(drawer.element()).borderTopLeftRadius).not.toBe('0px');

  await userEvent.keyboard('{Tab}');
  await expect.element(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
  await userEvent.keyboard('{Tab}');
  await expect.element(screen.getByRole('button', { name: '닫기' })).toHaveFocus();
  await userEvent.keyboard('{Tab}');
  await expect.element(screen.getByRole('textbox', { name: 'Keyword' })).toHaveFocus();

  await userEvent.keyboard('{Escape}');
  await expect.element(drawer).not.toBeInTheDocument();
  await expect.element(trigger).toHaveFocus();
  expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
});

test('each side sits on its own edge with the flat corners there', async () => {
  for (const side of ['top', 'bottom', 'left'] as const) {
    const screen = await render(
      <IdsProvider>
        <Sheet side={side} defaultOpen />
      </IdsProvider>,
    );
    const rect = sheetOf().getBoundingClientRect();
    const style = getComputedStyle(sheetOf());
    if (side === 'top') {
      expect(rect.top).toBeCloseTo(0, 0);
      expect(style.borderTopLeftRadius).toBe('0px');
      expect(style.borderBottomLeftRadius).not.toBe('0px');
    }
    if (side === 'bottom') {
      expect(rect.bottom).toBeCloseTo(window.innerHeight, 0);
      expect(rect.width).toBeCloseTo(window.innerWidth, 0);
      expect(style.borderBottomLeftRadius).toBe('0px');
      expect(style.borderTopLeftRadius).not.toBe('0px');
    }
    if (side === 'left') {
      expect(rect.left).toBeCloseTo(0, 0);
      expect(style.borderTopLeftRadius).toBe('0px');
      expect(style.borderTopRightRadius).not.toBe('0px');
    }
    await screen.unmount();
  }
});

test('a backdrop click closes and the drawer does not', async () => {
  const onOpenChange = vi.fn();
  const screen = await render(
    <IdsProvider>
      <Sheet defaultOpen onOpenChange={onOpenChange} />
    </IdsProvider>,
  );
  const drawer = screen.getByRole('dialog', { name: 'Filters' });
  await userEvent.click(drawer, { position: { x: 40, y: 200 } });
  expect(onOpenChange).not.toHaveBeenCalled();
  const backdrop = document.querySelector<HTMLElement>('[data-drawer-backdrop]')!;
  await userEvent.click(page.elementLocator(backdrop), { position: { x: 5, y: 5 } });
  await expect.element(drawer).not.toBeInTheDocument();
  expect(onOpenChange.mock.calls).toEqual([[false]]);
});

test('a drawer that cannot be dismissed ignores Escape, the backdrop and a flick', async () => {
  const screen = await render(
    <IdsProvider>
      <Sheet side="bottom" defaultOpen dismissible={false} role="alertdialog">
        <TallBody />
      </Sheet>
    </IdsProvider>,
  );
  const drawer = screen.getByRole('alertdialog', { name: 'Filters' });
  await userEvent.keyboard('{Escape}');
  await userEvent.click(page.elementLocator(document.querySelector('[data-drawer-backdrop]')!), {
    position: { x: 5, y: 5 },
  });
  const start = pointIn(sheetOf());
  await mouseDrag(start, down(start, 20, 120, 220, 320));
  await expect.element(drawer).toBeInTheDocument();
  await expect.poll(() => sheetOf().style.transform).toBe('');
});

test('the exit keeps the drawer until its animation ends, then reports completion', async () => {
  const onOpenChangeComplete = vi.fn();
  const screen = await render(
    <IdsProvider>
      <Drawer defaultOpen onOpenChangeComplete={onOpenChangeComplete}>
        <Drawer.Content aria-label="Slow" style={{ transition: 'translate 60s' }} />
      </Drawer>
    </IdsProvider>,
  );
  const drawer = screen.getByRole('dialog', { name: 'Slow' });
  await expect.element(drawer).toBeVisible();
  for (const animation of drawer.element().getAnimations()) animation.finish();
  await expect.poll(() => onOpenChangeComplete.mock.calls).toEqual([[true]]);
  await userEvent.keyboard('{Escape}');
  await expect.element(drawer).toHaveAttribute('data-ending-style');
  await new Promise(requestAnimationFrame);
  for (const animation of drawer.element().getAnimations()) animation.finish();
  await expect.element(drawer).not.toBeInTheDocument();
  expect(onOpenChangeComplete.mock.calls).toEqual([[true], [false]]);
});

describe('dragging with a mouse', () => {
  const renderBottom = async (extra?: ReactNode) => {
    const onOpenChange = vi.fn();
    const screen = await render(
      <IdsProvider>
        <Sheet side="bottom" defaultOpen onOpenChange={onOpenChange}>
          <TallBody />
          {extra}
        </Sheet>
      </IdsProvider>,
    );
    await expect.element(screen.getByRole('dialog', { name: 'Filters' })).toBeVisible();
    return { screen, onOpenChange };
  };

  test('a move below the threshold leaves the drawer where it is', async () => {
    const { screen, onOpenChange } = await renderBottom();
    const start = pointIn(sheetOf());
    await mouse('mousePressed', start);
    await mouse('mouseMoved', { x: start.x, y: start.y + DRAG_THRESHOLD - 3 });
    expect(sheetOf().style.transform).toBe('');
    expect(sheetOf().hasAttribute('data-dragging')).toBe(false);
    await mouse('mouseReleased', { x: start.x, y: start.y + DRAG_THRESHOLD - 3 });
    await expect.element(screen.getByRole('dialog', { name: 'Filters' })).toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  test('a fast flick closes', async () => {
    const { screen, onOpenChange } = await renderBottom();
    const start = pointIn(sheetOf());
    await mouseDrag(start, down(start, 15, 45, 75, 105));
    await expect.element(screen.getByRole('dialog', { name: 'Filters' })).not.toBeInTheDocument();
    expect(onOpenChange.mock.calls).toEqual([[false]]);
  });

  test('a slow short drag follows the pointer and springs back', async () => {
    const { screen, onOpenChange } = await renderBottom();
    const start = pointIn(sheetOf());
    await mouse('mousePressed', start);
    await mouse('mouseMoved', { x: start.x, y: start.y + 15 });
    await mouse('mouseMoved', { x: start.x, y: start.y + 55 });
    expect(translateY(sheetOf())).toBe(40);
    expect(sheetOf().hasAttribute('data-dragging')).toBe(true);
    await new Promise((resolve) => setTimeout(resolve, 150));
    await mouse('mouseReleased', { x: start.x, y: start.y + 55 });
    await expect.poll(() => sheetOf().style.transform).toBe('');
    expect(sheetOf().hasAttribute('data-dragging')).toBe(false);
    await expect.element(screen.getByRole('dialog', { name: 'Filters' })).toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  test('a slow drag past a quarter of the height closes', async () => {
    const { screen } = await renderBottom();
    const height = sheetOf().offsetHeight;
    const start = pointIn(sheetOf());
    await mouseDrag(start, down(start, 15, 15 + height * 0.3), { pauseBeforeRelease: true });
    await expect.element(screen.getByRole('dialog', { name: 'Filters' })).not.toBeInTheDocument();
  });

  test('pulling past the open position stretches a rubber band and comes back', async () => {
    await renderBottom();
    const start = pointIn(sheetOf());
    await mouse('mousePressed', start);
    await mouse('mouseMoved', { x: start.x, y: start.y - 15 });
    await mouse('mouseMoved', { x: start.x, y: start.y - 115 });
    expect(translateY(sheetOf())).toBeCloseTo(-rubberBand(100), 1);
    await mouse('mouseReleased', { x: start.x, y: start.y - 115 });
    await expect.poll(() => sheetOf().style.transform).toBe('');
  });

  test('a drag starting on a field or a no-drag region is left to that element', async () => {
    const { screen } = await renderBottom(
      <div data-drawer-no-drag className="h-20 shrink-0" data-testid="map" />,
    );
    for (const element of [
      screen.getByRole('textbox', { name: 'Keyword' }).element(),
      screen.getByTestId('map').element(),
    ]) {
      const start = pointIn(element as HTMLElement, 5);
      await mouse('mousePressed', start);
      await mouse('mouseMoved', { x: start.x, y: start.y + 60 });
      expect(sheetOf().style.transform).toBe('');
      await mouse('mouseReleased', { x: start.x, y: start.y + 60 });
    }
    await expect.element(screen.getByRole('dialog', { name: 'Filters' })).toBeInTheDocument();
  });

  test('dragging the sheet marks the handle while it moves and clears it on release', async () => {
    await renderBottom();
    const handle = document.querySelector<HTMLElement>('[data-drawer-handle]')!;
    const start = pointIn(handle, handle.offsetHeight / 2);
    const rest = getComputedStyle(handle).backgroundColor;

    await mouse('mousePressed', start);
    await mouse('mouseMoved', { x: start.x, y: start.y + 15 });
    await mouse('mouseMoved', { x: start.x, y: start.y + 55 });
    expect(handle.hasAttribute('data-dragging')).toBe(true);
    expect(getComputedStyle(handle).backgroundColor).not.toBe(rest);

    await new Promise((resolve) => setTimeout(resolve, 150));
    await mouse('mouseReleased', { x: start.x, y: start.y + 55 });
    await expect.poll(() => handle.hasAttribute('data-dragging')).toBe(false);
    await expect.element(sheetOf()).toBeVisible();
    expect(getComputedStyle(handle).backgroundColor).toBe(rest);
  });

  test('dragging the scrollbar thumb inside the sheet leaves the handle alone', async () => {
    await renderBottom(<div className="h-500 shrink-0" />);
    const handle = document.querySelector<HTMLElement>('[data-drawer-handle]')!;
    const rest = getComputedStyle(handle).backgroundColor;
    const body = sheetOf().querySelector<HTMLElement>('[data-scroll-area-viewport]')!;
    await expect.element(sheetOf()).toHaveAttribute('data-overflow-y');

    const bodyRect = body.getBoundingClientRect();
    await mouse('mouseMoved', {
      x: bodyRect.left + bodyRect.width / 2,
      y: bodyRect.top + bodyRect.height / 2,
    });
    const bar = sheetOf().querySelector<HTMLElement>('[data-scroll-area-scrollbar]')!;
    await expect.element(bar).toHaveAttribute('data-visible');

    const thumbRect = bar.querySelector('[data-scroll-area-thumb]')!.getBoundingClientRect();
    const start = { x: thumbRect.left + thumbRect.width / 2, y: thumbRect.top + 4 };
    await mouse('mousePressed', start);
    await mouse('mouseMoved', { x: start.x, y: start.y + 20 });
    await mouse('mouseMoved', { x: start.x, y: start.y + 60 });
    await expect.element(bar).toHaveAttribute('data-dragging');
    expect(body.scrollTop).toBeGreaterThan(0);
    expect(handle.hasAttribute('data-dragging')).toBe(false);
    expect(getComputedStyle(handle).backgroundColor).toBe(rest);

    await mouse('mouseReleased', { x: start.x, y: start.y + 60 });
    await expect.element(bar).not.toHaveAttribute('data-dragging');
  });

  test('a drag inside a scrolled list scrolls instead of moving the drawer', async () => {
    const { screen } = await renderBottom(
      <div className="h-40 shrink-0 overflow-y-auto" data-testid="list">
        <div className="h-[600px]" />
      </div>,
    );
    const list = screen.getByTestId('list').element() as HTMLElement;
    list.scrollTop = 100;
    const start = pointIn(list, 20);
    await mouse('mousePressed', start);
    await mouse('mouseMoved', { x: start.x, y: start.y + 40 });
    expect(sheetOf().style.transform).toBe('');
    await mouse('mouseReleased', { x: start.x, y: start.y + 40 });
  });
});

test('with motion on, a release springs back and the page animates out before it is restored', async () => {
  await cdp().send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }],
  });
  onTestFinished(async () => {
    await cdp().send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
    });
  });
  const screen = await render(
    <IdsProvider>
      <Sheet side="bottom" defaultOpen>
        <TallBody />
      </Sheet>
    </IdsProvider>,
  );
  const root = screen.container.querySelector<HTMLElement>('[data-color]')!;
  const finish = (element: Element) => {
    for (const animation of element.getAnimations()) animation.finish();
  };
  await expect.element(screen.getByRole('dialog', { name: 'Filters' })).toBeVisible();
  await new Promise(requestAnimationFrame);
  finish(sheetOf());
  finish(root);

  const start = pointIn(sheetOf());
  await mouseDrag(start, down(start, 15, 55), { pauseBeforeRelease: true });
  const spring = sheetOf()
    .getAnimations()
    .filter((animation) => (animation as CSSTransition).transitionProperty === 'transform');
  expect(spring).toHaveLength(1);
  expect(sheetOf().style.transform).toBe('');

  await userEvent.keyboard('{Escape}');
  await expect.poll(() => root.style.transform).toContain('scale(1)');
  expect(document.body.style.background).toContain('black');
  finish(root);
  await expect.poll(() => root.style.transform).toBe('');
  expect(document.body.style.background).toBe('');
});

describe('dragging with touch', () => {
  test('a touch below the threshold does nothing and a flick closes', async () => {
    const onOpenChange = vi.fn();
    const screen = await render(
      <IdsProvider>
        <Sheet side="bottom" defaultOpen onOpenChange={onOpenChange}>
          <TallBody />
        </Sheet>
      </IdsProvider>,
    );
    const start = pointIn(sheetOf());
    await touch('touchStart', start);
    await touch('touchMove', { x: start.x, y: start.y + 6 });
    expect(sheetOf().style.transform).toBe('');
    await touch('touchEnd');
    expect(onOpenChange).not.toHaveBeenCalled();

    await touch('touchStart', start);
    for (const point of down(start, 15, 50, 85, 120)) await touch('touchMove', point);
    await touch('touchEnd');
    await expect.element(screen.getByRole('dialog', { name: 'Filters' })).not.toBeInTheDocument();
    expect(onOpenChange.mock.calls).toEqual([[false]]);
  });

  test('a cancelled touch puts the drawer back', async () => {
    const screen = await render(
      <IdsProvider>
        <Sheet side="bottom" defaultOpen>
          <TallBody />
        </Sheet>
      </IdsProvider>,
    );
    const start = pointIn(sheetOf());
    await touch('touchStart', start);
    await touch('touchMove', { x: start.x, y: start.y + 15 });
    await touch('touchMove', { x: start.x, y: start.y + 75 });
    expect(translateY(sheetOf())).toBe(60);
    await touch('touchCancel');
    await expect.poll(() => sheetOf().style.transform).toBe('');
    await expect.element(screen.getByRole('dialog', { name: 'Filters' })).toBeInTheDocument();
  });

  test('a right drawer follows a horizontal swipe and closes on a flick', async () => {
    const screen = await render(
      <IdsProvider>
        <Sheet defaultOpen />
      </IdsProvider>,
    );
    const start = pointIn(sheetOf(), 200);
    await touch('touchStart', start);
    await touch('touchMove', { x: start.x + 4, y: start.y + 14 });
    expect(sheetOf().style.transform).toBe('');
    await touch('touchEnd');
    await touch('touchStart', start);
    for (const dx of [15, 50, 85, 120]) await touch('touchMove', { x: start.x + dx, y: start.y });
    await touch('touchEnd');
    await expect.element(screen.getByRole('dialog', { name: 'Filters' })).not.toBeInTheDocument();
  });
});

describe('snap points', () => {
  const snapPoints = [0.25, 0.5, 1] as const;

  test('opens at the first point and a release snaps to the nearest one', async () => {
    const onActiveSnapPointChange = vi.fn();
    await render(
      <IdsProvider>
        <Sheet
          side="bottom"
          defaultOpen
          snapPoints={snapPoints}
          onActiveSnapPointChange={onActiveSnapPointChange}
        />
      </IdsProvider>,
    );
    const size = sheetOf().offsetHeight;
    const offsets = snapOffsets(snapPoints, size, window.innerHeight);
    await expect.poll(() => translateY(sheetOf())).toBeCloseTo(offsets[0]!, 0);
    const backdrop = document.querySelector<HTMLElement>('[data-drawer-backdrop]')!;
    expect(backdrop.style.getPropertyValue('--drawer-fade')).toBe('0');

    const start = {
      x: window.innerWidth / 2,
      y: window.innerHeight - window.innerHeight * 0.25 + 20,
    };
    const travel = (offsets[0]! - offsets[1]!) * 0.7;
    await mouseDrag(
      start,
      [
        { x: start.x, y: start.y - 15 },
        { x: start.x, y: start.y - 15 - travel },
      ],
      { pauseBeforeRelease: true },
    );
    await expect.poll(() => translateY(sheetOf())).toBeCloseTo(offsets[1]!, 0);
    expect(onActiveSnapPointChange.mock.calls).toEqual([[0.5]]);
  });

  test('the handle cycles through the points with the keyboard and the backdrop fades in last', async () => {
    const onActiveSnapPointChange = vi.fn();
    const screen = await render(
      <IdsProvider>
        <Sheet
          side="bottom"
          defaultOpen
          snapPoints={snapPoints}
          onActiveSnapPointChange={onActiveSnapPointChange}
        />
      </IdsProvider>,
    );
    const handle = screen.getByRole('button', { name: '끌어서 크기 조절' });
    await expect.element(screen.getByRole('textbox', { name: 'Keyword' })).toHaveFocus();
    const backdrop = document.querySelector<HTMLElement>('[data-drawer-backdrop]')!;
    (handle.element() as HTMLElement).focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    await expect.poll(() => translateY(sheetOf())).toBe(0);
    expect(backdrop.style.getPropertyValue('--drawer-fade')).toBe('1');
    await userEvent.keyboard('{Enter}');
    expect(onActiveSnapPointChange.mock.calls).toEqual([[0.5], [1], [0.25]]);
    await expect.poll(() => backdrop.style.getPropertyValue('--drawer-fade')).toBe('0');
  });

  test('without snap points the handle is a picture, not a button', async () => {
    const screen = await render(
      <IdsProvider>
        <Sheet side="bottom" defaultOpen />
      </IdsProvider>,
    );
    await expect.element(screen.getByRole('dialog', { name: 'Filters' })).toBeVisible();
    const handle = document.querySelector('[data-drawer-handle]')!;
    expect(handle.tagName).toBe('DIV');
    expect(handle).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('background scale', () => {
  const rootOf = (screen: { container: HTMLElement }) =>
    screen.container.querySelector<HTMLElement>('[data-color]')!;

  test('a modal drawer scales the outermost provider root and restores it after closing', async () => {
    const screen = await render(
      <IdsProvider>
        <IdsProvider mode="dark">
          <Sheet side="bottom" />
        </IdsProvider>
      </IdsProvider>,
    );
    const root = rootOf(screen);
    await userEvent.click(screen.getByRole('button', { name: 'Open filters' }));
    await expect.element(screen.getByRole('dialog', { name: 'Filters' })).toBeVisible();
    await expect.poll(() => root.style.transform).toContain('scale(');
    expect(root.style.transform).toContain(
      `scale(${(window.innerWidth - 26) / window.innerWidth})`,
    );
    expect(root.style.borderRadius).toBe('8px');
    expect(root.style.overflow).toBe('clip');
    expect(document.body.style.background).toContain('black');
    expect(
      screen.container.querySelectorAll('[data-color]')[1]!.getAttribute('style'),
    ).not.toContain('transform');
    expect(sheetOf().getBoundingClientRect().bottom).toBeCloseTo(window.innerHeight, 0);
    expect(sheetOf().getBoundingClientRect().width).toBeCloseTo(window.innerWidth, 0);

    await userEvent.keyboard('{Escape}');
    await expect.poll(() => root.style.transform).toBe('');
    expect(root.style.borderRadius).toBe('');
    expect(root.style.overflow).toBe('');
    expect(root.style.clipPath).toBe('');
    expect(document.body.style.background).toBe('');
  });

  test('scaleBackground={false} and a non-modal drawer leave the page alone', async () => {
    for (const props of [{ scaleBackground: false }, { modal: false }]) {
      const screen = await render(
        <IdsProvider>
          <Sheet defaultOpen {...props} />
        </IdsProvider>,
      );
      await expect.element(screen.getByRole('dialog', { name: 'Filters' })).toBeVisible();
      expect(rootOf(screen).style.transform).toBe('');
      expect(document.body.style.background).toBe('');
      await screen.unmount();
    }
  });

  test('fixed elements of the page stay where they were on screen and scale with it', async () => {
    const screen = await render(
      <IdsProvider>
        <div className="h-[3000px]" />
        <FloatingButton aria-label="Compose">+</FloatingButton>
        <Sheet side="bottom" />
      </IdsProvider>,
    );
    window.scrollTo(0, 1200);
    const fab = screen.getByRole('button', { name: 'Compose' }).element() as HTMLElement;
    const before = fab.getBoundingClientRect();
    await userEvent.click(screen.getByRole('button', { name: 'Open filters' }));
    await expect.poll(() => rootOf(screen).style.transform).toContain('scale(');
    const scale = (window.innerWidth - 26) / window.innerWidth;
    const after = fab.getBoundingClientRect();
    expect(after.top).toBeCloseTo(scale * before.top + 14, 0);
    expect(after.left).toBeCloseTo(
      window.innerWidth / 2 + scale * (before.left - window.innerWidth / 2),
      0,
    );
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => rootOf(screen).style.transform).toBe('');
    expect(fab.style.translate).toBe('');
    const restored = fab.getBoundingClientRect();
    expect(restored.top).toBeCloseTo(before.top, 0);
    window.scrollTo(0, 0);
  });
});

test('a drawer opened from a drawer pushes the parent back, and only the parent scales the page', async () => {
  const screen = await render(
    <IdsProvider>
      <Drawer side="bottom" defaultOpen>
        <Drawer.Content>
          <Drawer.Title>Outer</Drawer.Title>
          <Drawer side="bottom">
            <Drawer.Trigger>More</Drawer.Trigger>
            <Drawer.Content>
              <Drawer.Title>Inner</Drawer.Title>
            </Drawer.Content>
          </Drawer>
        </Drawer.Content>
      </Drawer>
    </IdsProvider>,
  );
  const root = screen.container.querySelector<HTMLElement>('[data-color]')!;
  const outer = screen.getByRole('dialog', { name: 'Outer' }).element() as HTMLElement;
  await expect.poll(() => root.style.transform).toContain('scale(');
  const scaled = root.style.transform;
  await userEvent.click(screen.getByRole('button', { name: 'More' }));
  await expect.element(screen.getByRole('dialog', { name: 'Inner' })).toBeVisible();
  await expect.poll(() => outer.hasAttribute('data-nested-open')).toBe(true);
  const expected = (window.innerWidth - 16) / window.innerWidth;
  const [scaleX] = getComputedStyle(outer).scale.split(' ').map(Number);
  expect(scaleX).toBeCloseTo(expected, 4);
  expect(getComputedStyle(outer).translate).toBe('0px -16px');
  expect(root.style.transform).toBe(scaled);

  await userEvent.keyboard('{Escape}');
  await expect.element(screen.getByRole('dialog', { name: 'Inner' })).not.toBeInTheDocument();
  await expect.poll(() => outer.hasAttribute('data-nested-open')).toBe(false);
  expect(root.style.transform).toBe(scaled);
  await userEvent.keyboard('{Escape}');
  await expect.poll(() => root.style.transform).toBe('');
});

test('Escape closes a Select sheet inside first, then the drawer', async () => {
  const screen = await render(
    <IdsProvider>
      <Sheet side="bottom" defaultOpen>
        <Select aria-label="Sort" mobileVariant="drawer">
          <Select.Item value="new">Newest</Select.Item>
          <Select.Item value="old">Oldest</Select.Item>
        </Select>
      </Sheet>
    </IdsProvider>,
  );
  const drawer = screen.getByRole('dialog', { name: 'Filters' });
  const select = screen.getByRole('combobox', { name: 'Sort' });
  await userEvent.click(select);
  await expect.element(screen.getByRole('listbox')).toBeVisible();
  await expect.poll(() => drawer.element().hasAttribute('data-nested-open')).toBe(true);
  await userEvent.click(screen.getByRole('option', { name: 'Oldest' }));
  await expect.element(select).toHaveTextContent('Oldest');
  expect(sheetOf().style.transform).toBe('');
  await userEvent.click(select);
  await expect.element(screen.getByRole('listbox')).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await expect.element(screen.getByRole('listbox')).not.toBeInTheDocument();
  await expect.element(drawer).toBeInTheDocument();
  await expect.element(select).toHaveFocus();
  await userEvent.keyboard('{Escape}');
  await expect.element(drawer).not.toBeInTheDocument();
});

test('a non-modal drawer leaves the page usable and stays open on a press outside', async () => {
  await page.viewport(800, 896);
  const pressed = vi.fn();
  const screen = await render(
    <IdsProvider className="flex justify-end">
      <Button onClick={pressed}>Page action</Button>
      <Sheet side="left" modal={false} defaultOpen />
    </IdsProvider>,
  );
  const drawer = screen.getByRole('dialog', { name: 'Filters' });
  await expect.element(drawer).not.toHaveAttribute('aria-modal');
  expect(document.querySelector('[data-drawer-backdrop]')).toBeNull();
  await userEvent.click(screen.getByRole('button', { name: 'Page action' }));
  expect(pressed).toHaveBeenCalledOnce();
  await expect.element(drawer).toBeInTheDocument();
  (screen.getByRole('textbox', { name: 'Keyword' }).element() as HTMLElement).focus();
  await userEvent.keyboard('{Escape}');
  await expect.element(drawer).not.toBeInTheDocument();
  await page.viewport(414, 896);
});

test('overlay.open resolves with the value the drawer is closed with', async () => {
  const screen = await render(<IdsProvider>page</IdsProvider>);
  const pick = overlay.open<string>(({ close }) => (
    <Drawer side="bottom">
      <Drawer.Content>
        <Drawer.Title>Share</Drawer.Title>
        <Button onClick={() => close('link')}>Copy link</Button>
      </Drawer.Content>
    </Drawer>
  ));
  await userEvent.click(screen.getByRole('button', { name: 'Copy link' }));
  await expect(pick).resolves.toBe('link');
  await expect.element(screen.getByRole('dialog', { name: 'Share' })).not.toBeInTheDocument();
});
