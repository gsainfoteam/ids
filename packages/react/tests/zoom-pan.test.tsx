import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { describe, expect, onTestFinished, test, vi } from 'vitest';
import { cdp, userEvent, type Locator } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { skipWithoutCdp } from './engines';
import {
  createZoomPan,
  DEFAULT_MAX_SCALE,
  type ZoomPan,
  type ZoomPanSettings,
} from '../src/internal/zoom-pan';
import {
  clampPan,
  coast,
  MOMENTUM_TIME,
  panLimit,
  pinchView,
  settle,
  wheelZoomFactor,
  zoomAround,
} from '../src/internal/zoom-pan/math';

type Point = { x: number; y: number };
type Size = { width: number; height: number };

const AREA = 200;
const SQUARE: Size = { width: 200, height: 200 };
const WIDE: Size = { width: 200, height: 100 };

type HarnessProps = Partial<Omit<ZoomPanSettings, 'onCommit'>> & {
  scale?: number;
  defaultScale?: number;
  onScaleChange?: (scale: number) => void;
  disabled?: boolean;
  size?: Size;
  onReady?: (zoom: ZoomPan) => void;
};

function Harness({
  scale: controlled,
  defaultScale = 1,
  onScaleChange,
  maxScale = DEFAULT_MAX_SCALE,
  disabled = false,
  size = SQUARE,
  onReady,
  ...callbacks
}: HarnessProps) {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [content, setContent] = useState<HTMLElement | null>(null);
  const [zoom, setZoom] = useState<ZoomPan | null>(null);
  const [own, setOwn] = useState(defaultScale);
  const [commits, setCommits] = useState(0);
  const scale = controlled ?? own;

  const settings: ZoomPanSettings = {
    ...callbacks,
    maxScale,
    onCommit: (next) => {
      setOwn(next);
      setCommits((count) => count + 1);
      onScaleChange?.(next);
    },
  };
  const latest = useRef({ settings, scale });
  useLayoutEffect(() => {
    latest.current = { settings, scale };
  });

  useLayoutEffect(() => {
    if (!element || !content || disabled) return;

    const created = createZoomPan(element, content, {
      scale: latest.current.scale,
      read: () => latest.current.settings,
    });
    setZoom(created);

    return () => {
      created.dispose();
      setZoom(null);
    };
  }, [element, content, disabled]);

  useLayoutEffect(() => {
    zoom?.follow(scale);
  }, [zoom, scale, commits]);

  useEffect(() => {
    if (zoom) onReady?.(zoom);
  }, [zoom, onReady]);

  return (
    <div>
      <div
        ref={setElement}
        tabIndex={0}
        data-testid="area"
        onKeyDown={(event) => zoom?.onKeyDown(event)}
        style={{
          width: AREA,
          height: AREA,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <div
          ref={setContent}
          data-testid="content"
          style={{ ...size, position: 'relative', flexShrink: 0, background: 'gray' }}
        >
          <span
            data-testid="spot"
            style={{ position: 'absolute', left: 30, top: 20, width: 10, height: 10 }}
          />
        </div>
      </div>
      <output data-testid="scale">{scale}</output>
      <span
        data-testid="far-right"
        style={{ position: 'absolute', left: 390, top: 90, width: 20, height: 20 }}
      />
    </div>
  );
}

const withoutNegativeZero = (value: number) => value + 0;

const viewOf = (element: Element) => {
  const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
  return {
    scale: matrix.a,
    x: withoutNegativeZero(matrix.e),
    y: withoutNegativeZero(matrix.f),
  };
};

const centerOf = (element: Element): Point => {
  const rect = element.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
};

const POINTERS_LAND_ON_WHOLE_PIXELS_OUTSIDE_CHROMIUM = 1;

function expectWithinAPixel(actual: Point, expected: Point) {
  expect(Math.abs(actual.x - expected.x)).toBeLessThanOrEqual(
    POINTERS_LAND_ON_WHOLE_PIXELS_OUTSIDE_CHROMIUM,
  );
  expect(Math.abs(actual.y - expected.y)).toBeLessThanOrEqual(
    POINTERS_LAND_ON_WHOLE_PIXELS_OUTSIDE_CHROMIUM,
  );
}

const userSelectOf = (element: Element) => {
  const style = getComputedStyle(element);
  return style.getPropertyValue('user-select') || style.getPropertyValue('-webkit-user-select');
};

const frameOffset = (point: Point) => {
  const frame = window.frameElement!.getBoundingClientRect();
  const scale = frame.width / window.innerWidth;
  return { x: frame.left + point.x * scale, y: frame.top + point.y * scale };
};

const FRAME_MS = 16;
let inputClock = Date.now();

const inputTimestamp = ({ startsGesture }: { startsGesture: boolean }) => {
  inputClock = startsGesture ? Math.max(Date.now(), inputClock + FRAME_MS) : inputClock + FRAME_MS;
  return inputClock / 1000;
};

async function mouse(type: 'mousePressed' | 'mouseMoved' | 'mouseReleased', point: Point) {
  await cdp().send('Input.dispatchMouseEvent', {
    type,
    ...frameOffset(point),
    button: 'left',
    buttons: type === 'mouseReleased' ? 0 : 1,
    clickCount: 1,
    timestamp: inputTimestamp({ startsGesture: type === 'mousePressed' }),
  });
}

async function touch(type: 'touchStart' | 'touchMove' | 'touchEnd', fingers: Point[]) {
  await cdp().send('Input.dispatchTouchEvent', {
    type,
    touchPoints: fingers.map((point, finger) => ({ ...frameOffset(point), id: finger })),
    timestamp: inputTimestamp({ startsGesture: type === 'touchStart' && fingers.length === 1 }),
  });
}

const offsetFrom = (origin: Point, dx: number, dy: number): Point => ({
  x: origin.x + dx,
  y: origin.y + dy,
});

async function motionOn() {
  await cdp().send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }],
  });
  onTestFinished(async () => {
    await cdp().send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
    });
  });
}

const parts = (screen: { getByTestId: (id: string) => Locator }) => ({
  area: screen.getByTestId('area').element() as HTMLElement,
  content: screen.getByTestId('content').element() as HTMLElement,
  spot: screen.getByTestId('spot'),
  scale: screen.getByTestId('scale'),
});

describe('math', () => {
  test('a view pans only as far as the scaled image covers the area', () => {
    expect(panLimit(1, SQUARE, SQUARE)).toEqual({ x: 0, y: 0 });
    expect(panLimit(2, WIDE, SQUARE)).toEqual({ x: 100, y: 0 });
    expect(clampPan({ scale: 2, x: 300, y: -40 }, WIDE, SQUARE)).toEqual({
      scale: 2,
      x: 100,
      y: 0,
    });
    expect(clampPan({ scale: 3, x: -80, y: 90 }, SQUARE, SQUARE)).toEqual({
      scale: 3,
      x: -80,
      y: 90,
    });
  });

  test('zooming around a point keeps that point where it was', () => {
    const around = { x: -40, y: 25 };
    const before = { scale: 1.5, x: 10, y: -5 };
    const after = zoomAround(before, 3, around);
    const underBefore = { x: (around.x - before.x) / before.scale, y: (around.y - before.y) / 1.5 };
    expect(after.scale).toBe(3);
    expect(after.x + underBefore.x * 3).toBeCloseTo(around.x);
    expect(after.y + underBefore.y * 3).toBeCloseTo(around.y);
  });

  test('the wheel zooms by powers of two per pixel, line and page, like PhotoSwipe', () => {
    expect(wheelZoomFactor(-100, 0)).toBeCloseTo(2 ** 0.2);
    expect(wheelZoomFactor(100, 0)).toBeCloseTo(2 ** -0.2);
    expect(wheelZoomFactor(-3, 1)).toBeCloseTo(2 ** 0.15);
    expect(wheelZoomFactor(1, 2)).toBeCloseTo(0.5);
  });

  test('a pinch scales with the finger spread and resists past the limits', () => {
    const start = { view: { scale: 1, x: 0, y: 0 }, midpoint: { x: 0, y: 0 }, distance: 100 };
    expect(pinchView(start, { x: 0, y: 0 }, 250, 4).scale).toBeCloseTo(2.5);
    expect(pinchView(start, { x: 0, y: 0 }, 50, 4).scale).toBeCloseTo(1 - 0.5 * 0.15);
    expect(pinchView(start, { x: 0, y: 0 }, 600, 4).scale).toBeCloseTo(4 + 2 * 0.05);
    const moved = pinchView(start, { x: 30, y: -10 }, 200, 4);
    expect(moved).toEqual({ scale: 2, x: 30, y: -10 });
  });

  test('a released pinch settles inside the limits, and a fling coasts into the bounds', () => {
    expect(settle({ scale: 0.8, x: 5, y: 5 }, { x: 0, y: 0 }, SQUARE, SQUARE, 4)).toEqual({
      scale: 1,
      x: 0,
      y: 0,
    });
    expect(settle({ scale: 5, x: 0, y: 0 }, { x: 0, y: 0 }, SQUARE, SQUARE, 4).scale).toBe(4);
    expect(coast({ scale: 2, x: 0, y: 0 }, { x: 0.1, y: 1 }, SQUARE, SQUARE)).toEqual({
      scale: 2,
      x: 0.1 * MOMENTUM_TIME,
      y: 100,
    });
  });
});

test('the area stops the browser from panning, zooming and selecting while it listens', async () => {
  const screen = await render(<Harness />);
  const { area } = parts(screen);
  await expect.poll(() => getComputedStyle(area).touchAction).toBe('none');
  expect(userSelectOf(area)).toBe('none');

  const safariPinch = new Event('gesturestart', { cancelable: true });
  area.dispatchEvent(safariPinch);
  expect(safariPinch.defaultPrevented, 'Safari pinch never zooms the page').toBe(true);

  await screen.rerender(<Harness disabled />);
  await expect.poll(() => getComputedStyle(area).touchAction).toBe('auto');
});

test('the wheel zooms around the cursor and reports the settled scale', async () => {
  const onScaleChange = vi.fn();
  const screen = await render(<Harness onScaleChange={onScaleChange} />);
  const { area, content, spot, scale } = parts(screen);
  const before = centerOf(spot.element());
  const wheeled = new Promise<WheelEvent>((resolve) =>
    area.addEventListener('wheel', resolve, { once: true }),
  );

  await userEvent.wheel(spot, { delta: { y: -100 } });
  const event = await wheeled;
  const factor = wheelZoomFactor(event.deltaY, event.deltaMode);

  expect(event.defaultPrevented).toBe(true);
  await expect.poll(() => viewOf(content).scale).toBeCloseTo(factor, 3);
  expectWithinAPixel(centerOf(spot.element()), before);
  await expect.element(scale).toHaveTextContent(String(Math.round(factor * 1000) / 1000));
  expect(onScaleChange).toHaveBeenLastCalledWith(Math.round(factor * 1000) / 1000);

  await userEvent.wheel(spot, { delta: { y: 400 } });
  await expect.element(scale).toHaveTextContent('1');
  expect(getComputedStyle(content).transform).toBe('none');
});

test('keys zoom around the center, and arrows pan only while zoomed, up to the edges', async () => {
  const screen = await render(<Harness size={WIDE} />);
  const { area, content, scale } = parts(screen);
  const unhandled = vi.fn();
  const recordUnhandled = (event: KeyboardEvent) => {
    if (!event.defaultPrevented) unhandled(event.key);
  };
  document.addEventListener('keydown', recordUnhandled);
  onTestFinished(() => document.removeEventListener('keydown', recordUnhandled));

  await userEvent.click(area);
  await userEvent.keyboard('{ArrowRight}');
  expect(unhandled).toHaveBeenCalledWith('ArrowRight');

  await userEvent.keyboard('+');
  await expect.element(scale).toHaveTextContent('2');
  expect(viewOf(content)).toEqual({ scale: 2, x: 0, y: 0 });
  await userEvent.keyboard('=');
  await expect.element(scale).toHaveTextContent('4');
  await userEvent.keyboard('+');
  await expect.element(scale).toHaveTextContent('4');
  await userEvent.keyboard('-');
  await expect.element(scale).toHaveTextContent('2');

  unhandled.mockClear();
  await userEvent.keyboard('{ArrowLeft}{ArrowLeft}{ArrowLeft}');
  expect(viewOf(content).x, 'stops at the left edge of the image').toBe(100);
  await userEvent.keyboard('{ArrowRight}{ArrowDown}');
  expect(viewOf(content)).toEqual({ scale: 2, x: 50, y: 0 });
  expect(unhandled, 'arrows belong to the view while it is zoomed').not.toHaveBeenCalled();

  await userEvent.keyboard('0');
  await expect.element(scale).toHaveTextContent('1');
  expect(getComputedStyle(content).transform).toBe('none');
});

test('a double click zooms in at the pointer and the next one zooms back out', async () => {
  const onScaleChange = vi.fn();
  const screen = await render(<Harness onScaleChange={onScaleChange} />);
  const { area, content, spot, scale } = parts(screen);
  const before = centerOf(spot.element());

  await userEvent.dblClick(spot);
  await expect.element(scale).toHaveTextContent('2');
  expectWithinAPixel(centerOf(spot.element()), before);

  await userEvent.dblClick(area);
  await expect.element(scale).toHaveTextContent('1');
  expect(getComputedStyle(content).transform).toBe('none');
  expect(onScaleChange.mock.calls).toEqual([[2], [1]]);
});

test('dragging a zoomed image pans it and stops at its edges', async () => {
  const screen = await render(<Harness size={WIDE} />);
  const { area, content, scale } = parts(screen);
  await userEvent.click(area);
  await userEvent.keyboard('+');
  await expect.element(scale).toHaveTextContent('2');

  await userEvent.dragAndDrop(screen.getByTestId('area'), screen.getByTestId('far-right'));
  await expect.poll(() => viewOf(content)).toEqual({ scale: 2, x: 100, y: 0 });
  await expect.element(scale).toHaveTextContent('2');
});

test('a fling coasts with motion on and stops where it was let go with motion reduced', async (context) => {
  skipWithoutCdp(context);
  const screen = await render(<Harness defaultScale={2} />);
  const { area, content } = parts(screen);
  const start = centerOf(area);
  const fling = async () => {
    await mouse('mousePressed', start);
    for (const step of [10, 20, 30, 40]) await mouse('mouseMoved', offsetFrom(start, step, 0));
    await mouse('mouseReleased', offsetFrom(start, 40, 0));
  };

  await fling();
  expect(viewOf(content)).toEqual({ scale: 2, x: 40, y: 0 });
  expect(content.getAnimations()).toEqual([]);

  await userEvent.keyboard('0');
  await motionOn();
  await userEvent.click(area);
  await userEvent.keyboard('+');
  for (const animation of content.getAnimations()) animation.finish();

  await fling();
  expect(content.getAnimations()).toHaveLength(1);
  for (const animation of content.getAnimations()) animation.finish();
  expect(viewOf(content).x, 'coasts past the release point up to the edge').toBe(100);
});

test('a pinch zooms around the midpoint of the two fingers and settles inside the limits', async (context) => {
  skipWithoutCdp(context);
  const onPinchStart = vi.fn();
  const screen = await render(<Harness onPinchStart={onPinchStart} />);
  const { area, content, scale } = parts(screen);
  const center = centerOf(area);
  const left = offsetFrom(center, -60, 0);
  const right = offsetFrom(center, -20, 0);

  await touch('touchStart', [left]);
  await touch('touchStart', [left, right]);
  expect(onPinchStart).toHaveBeenCalledOnce();
  await touch('touchMove', [offsetFrom(left, -40, 0), offsetFrom(right, 40, 0)]);
  await expect.poll(() => viewOf(content).scale).toBeCloseTo(3);
  const spread = viewOf(content);
  expect(spread.x, 'the midpoint 40px left of center stays put').toBeCloseTo(80, 0);
  expect(spread.y).toBeCloseTo(0, 0);
  await touch('touchEnd', []);
  await expect.element(scale).toHaveTextContent('3');

  await touch('touchStart', [left]);
  await touch('touchStart', [left, right]);
  await touch('touchMove', [offsetFrom(left, 200, 0), offsetFrom(right, 200, 0)]);
  await touch('touchEnd', []);
  await expect.poll(() => viewOf(content).x, { message: 'the pan settles at the edge' }).toBe(200);
  await expect.element(scale).toHaveTextContent('3');
});

test('a pinch that ends below the fitted size springs back to it', async (context) => {
  skipWithoutCdp(context);
  const screen = await render(<Harness />);
  const { area, content, scale } = parts(screen);
  const center = centerOf(area);

  await touch('touchStart', [offsetFrom(center, -50, 0)]);
  await touch('touchStart', [offsetFrom(center, -50, 0), offsetFrom(center, 50, 0)]);
  await touch('touchMove', [offsetFrom(center, -10, 0), offsetFrom(center, 10, 0)]);
  await expect.poll(() => viewOf(content).scale).toBeLessThan(1);
  expect(viewOf(content).scale, 'resists below the fitted size').toBeGreaterThan(0.85);
  await touch('touchEnd', []);
  await expect.poll(() => getComputedStyle(content).transform).toBe('none');
  await expect.element(scale).toHaveTextContent('1');
});

test('swiping the fitted image down past the Drawer threshold closes, a short swipe rests', async (context) => {
  skipWithoutCdp(context);
  const onSwipe = vi.fn();
  const onSwipeClose = vi.fn();
  const screen = await render(<Harness onSwipe={onSwipe} onSwipeClose={onSwipeClose} />);
  const { area, content } = parts(screen);
  const start = centerOf(area);

  await touch('touchStart', [start]);
  for (const distance of [12, 20, 30]) await touch('touchMove', [offsetFrom(start, 0, distance)]);
  await expect
    .poll(() => viewOf(content).y, { message: 'follows from where it latched' })
    .toBeCloseTo(18, 0);
  expect(onSwipe).toHaveBeenLastCalledWith(expect.any(Number), true);
  expect(onSwipe.mock.lastCall![0], 'the backdrop fades as in Drawer').toBeCloseTo(1 - 18 / AREA);
  inputClock += 200;
  await touch('touchEnd', []);
  expect(onSwipeClose).not.toHaveBeenCalled();
  expect(onSwipe).toHaveBeenLastCalledWith(1, false);
  expect(getComputedStyle(content).transform).toBe('none');

  await touch('touchStart', [start]);
  for (const distance of [12, 60, 110, 150])
    await touch('touchMove', [offsetFrom(start, 0, distance)]);
  await touch('touchEnd', []);
  expect(onSwipeClose).toHaveBeenCalledOnce();
});

test('a sideways drag of the fitted image is left to the slide track', async (context) => {
  skipWithoutCdp(context);
  const onSwipe = vi.fn();
  const screen = await render(<Harness onSwipe={onSwipe} onSwipeClose={vi.fn()} />);
  const { area, content } = parts(screen);
  const start = centerOf(area);

  await touch('touchStart', [start]);
  for (const distance of [15, 40, 80]) await touch('touchMove', [offsetFrom(start, distance, 4)]);
  await touch('touchEnd', []);
  expect(onSwipe).not.toHaveBeenCalled();
  expect(getComputedStyle(content).transform).toBe('none');
});

test('a second finger takes over a one-finger drag and pinches from there', async (context) => {
  skipWithoutCdp(context);
  const onSwipe = vi.fn();
  const onSwipeClose = vi.fn();
  const onPinchStart = vi.fn();
  let zoom: ZoomPan | undefined;
  const screen = await render(
    <Harness
      onSwipe={onSwipe}
      onSwipeClose={onSwipeClose}
      onPinchStart={onPinchStart}
      onReady={(api) => (zoom = api)}
    />,
  );
  const { area, content, scale } = parts(screen);
  const start = centerOf(area);
  const second = offsetFrom(start, 40, 40);

  await touch('touchStart', [start]);
  for (const distance of [12, 40]) await touch('touchMove', [offsetFrom(start, 0, distance)]);
  await expect.poll(() => viewOf(content).y).toBeCloseTo(28, 0);
  expect(onSwipe).toHaveBeenLastCalledWith(expect.any(Number), true);
  expect(zoom!.isZoomed()).toBe(false);

  await touch('touchStart', [offsetFrom(start, 0, 40), second]);
  expect(onPinchStart).toHaveBeenCalledOnce();
  expect(onSwipe).toHaveBeenLastCalledWith(1, false);
  expect(zoom!.isZoomed(), 'a slide track refuses drags while two fingers pinch').toBe(true);

  await touch('touchMove', [offsetFrom(start, -40, 0), offsetFrom(second, 40, 40)]);
  await expect.poll(() => viewOf(content).scale).toBeGreaterThan(1.5);
  await touch('touchEnd', []);
  await expect.poll(() => Number(scale.element().textContent)).toBeGreaterThan(1.5);
  expect(onSwipeClose).not.toHaveBeenCalled();
  expect(zoom!.isZoomed()).toBe(true);
});

test('a controlled scale is followed, and a parent that keeps its value wins over a gesture', async () => {
  const onScaleChange = vi.fn();
  const screen = await render(<Harness scale={2} onScaleChange={onScaleChange} />);
  const { area, content } = parts(screen);
  await expect.poll(() => viewOf(content)).toEqual({ scale: 2, x: 0, y: 0 });

  await screen.rerender(<Harness scale={1} onScaleChange={onScaleChange} />);
  await expect.poll(() => getComputedStyle(content).transform).toBe('none');

  await userEvent.click(area);
  await userEvent.keyboard('+');
  expect(onScaleChange).toHaveBeenCalledWith(2);
  await expect.poll(() => getComputedStyle(content).transform).toBe('none');
});
