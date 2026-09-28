import { clamp } from 'es-toolkit';

export type DrawerSide = 'top' | 'right' | 'bottom' | 'left';

export type SnapPoint = number | `${number}px`;

export type DragAxis = 'x' | 'y';

export type Point = { x: number; y: number };

export type Sample = { time: number; position: number };

export type Latch = 'pending' | 'drag' | 'cross-axis';

export type Release = { type: 'close' } | { type: 'rest'; index: number | null };

export const DRAG_THRESHOLD = 10;
export const CLOSE_VELOCITY = 0.4;
export const CLOSE_FRACTION = 0.25;
export const VELOCITY_WINDOW = 100;
export const FLICK_TO_END_VELOCITY = 2;
export const ONE_SNAP_STEP_WITHIN = 0.4;

const EDITABLE = 'input, textarea, select, [contenteditable]:not([contenteditable="false"])';
const NO_DRAG = '[data-drawer-no-drag]';

export const axisOf = (side: DrawerSide): DragAxis =>
  side === 'top' || side === 'bottom' ? 'y' : 'x';

export const closingSign = (side: DrawerSide) => (side === 'bottom' || side === 'right' ? 1 : -1);

export const alongAxis = (side: DrawerSide, delta: Point) =>
  axisOf(side) === 'y' ? delta.y : delta.x;

export const towardClose = (side: DrawerSide, delta: Point) =>
  alongAxis(side, delta) * closingSign(side);

export function latchAxis(side: DrawerSide, delta: Point): Latch {
  if (Math.hypot(delta.x, delta.y) < DRAG_THRESHOLD) return 'pending';
  const along = Math.abs(alongAxis(side, delta));
  const across = Math.abs(axisOf(side) === 'y' ? delta.x : delta.y);
  return along >= across ? 'drag' : 'cross-axis';
}

export const rubberBand = (distance: number) => Math.max(0, 8 * (Math.log(distance + 1) - 2));

export function resistedOffset(offset: number, openLimit: number, closedLimit: number) {
  if (offset < openLimit) return openLimit - rubberBand(openLimit - offset);
  return Math.min(offset, closedLimit);
}

export function velocityOf(samples: readonly Sample[]) {
  const last = samples.at(-1);
  if (!last) return 0;
  const recent = samples.filter((sample) => last.time - sample.time <= VELOCITY_WINDOW);
  const first = recent[0]!;
  const elapsed = last.time - first.time;
  return elapsed > 0 ? (last.position - first.position) / elapsed : 0;
}

export const visibleExtent = (point: SnapPoint, viewport: number) =>
  typeof point === 'number' ? point * viewport : Number.parseFloat(point);

export const snapOffsets = (points: readonly SnapPoint[], size: number, viewport: number) =>
  points.map((point) => clamp(size - visibleExtent(point, viewport), 0, size));

export type ReleaseInput = {
  displacement: number;
  velocity: number;
  size: number;
  viewport: number;
  dismissible: boolean;
  snap?: { offsets: readonly number[]; index: number };
};

export function releaseTarget(input: ReleaseInput): Release {
  return input.snap ? releaseBetweenSnapPoints(input, input.snap) : releaseWhole(input);
}

function releaseWhole({ displacement, velocity, size, dismissible }: ReleaseInput): Release {
  const rest: Release = { type: 'rest', index: null };
  if (displacement <= 0 || !dismissible) return rest;
  const flicked = velocity > CLOSE_VELOCITY;
  const pulledFarEnough = displacement >= size * CLOSE_FRACTION;
  return flicked || pulledFarEnough ? { type: 'close' } : rest;
}

function releaseBetweenSnapPoints(
  { displacement, velocity, size, viewport, dismissible }: ReleaseInput,
  { offsets, index }: { offsets: readonly number[]; index: number },
): Release {
  const last = offsets.length - 1;
  const restAt = (at: number): Release => ({ type: 'rest', index: clamp(at, 0, last) });
  const closeOrLowest = dismissible ? ({ type: 'close' } as const) : restAt(0);

  if (velocity > FLICK_TO_END_VELOCITY) return closeOrLowest;
  if (velocity < -FLICK_TO_END_VELOCITY) return restAt(last);

  const quickShortStep =
    Math.abs(velocity) > CLOSE_VELOCITY && Math.abs(displacement) < viewport * ONE_SNAP_STEP_WITHIN;
  if (quickShortStep) {
    if (velocity < 0) return restAt(index + 1);
    return index === 0 ? closeOrLowest : restAt(index - 1);
  }

  const position = offsets[index]! + displacement;
  const candidates = offsets.map((offset, at) => ({ distance: Math.abs(offset - position), at }));
  if (dismissible) candidates.push({ distance: Math.abs(size - position), at: -1 });
  const nearest = candidates.reduce((best, candidate) =>
    candidate.distance < best.distance ? candidate : best,
  );
  return nearest.at < 0 ? { type: 'close' } : restAt(nearest.at);
}

export type Presence = {
  size: number;
  snap?: { offsets: readonly number[]; fadeFromIndex: number };
};

export function presenceAt(offset: number, { size, snap }: Presence) {
  if (!snap) return size > 0 ? clamp(1 - offset / size, 0, 1) : 1;
  const { offsets, fadeFromIndex } = snap;
  const opaque = offsets[clamp(fadeFromIndex, 0, offsets.length - 1)]!;
  const clear = fadeFromIndex > 0 ? offsets[fadeFromIndex - 1]! : size;
  if (clear <= opaque) return offset <= opaque ? 1 : 0;
  return clamp((clear - offset) / (clear - opaque), 0, 1);
}

export function translateAlong(side: DrawerSide, offset: number) {
  const distance = offset * closingSign(side);
  return axisOf(side) === 'y'
    ? `translate3d(0, ${distance}px, 0)`
    : `translate3d(${distance}px, 0, 0)`;
}

function canScrollBy(element: Element, axis: DragAxis, direction: number) {
  const style = getComputedStyle(element);
  const overflow = axis === 'y' ? style.overflowY : style.overflowX;
  if (overflow !== 'auto' && overflow !== 'scroll') return false;
  if (axis === 'y') {
    const max = element.scrollHeight - element.clientHeight;
    if (max <= 1) return false;
    return direction < 0 ? element.scrollTop > 0 : element.scrollTop < max - 1;
  }
  const max = element.scrollWidth - element.clientWidth;
  if (max <= 1) return false;
  const fromStart = Math.abs(element.scrollLeft);
  const rtl = style.direction === 'rtl';
  const towardStart = rtl ? direction > 0 : direction < 0;
  return towardStart ? fromStart > 0 : fromStart < max - 1;
}

export type DragStart = {
  target: Element;
  content: Element;
  selectingText: boolean;
};

export function mayStartDrag({ target, content, selectingText }: DragStart) {
  if (selectingText) return false;
  if (target.closest(NO_DRAG) || target.closest(EDITABLE)) return false;
  const nearestLayer = target.closest('[popover]');
  return nearestLayer === content || nearestLayer === null;
}

export function scrollsInstead(target: Element, content: Element, side: DrawerSide, delta: Point) {
  const axis = axisOf(side);
  const contentScrollDirection = -Math.sign(alongAxis(side, delta));
  for (let node: Element | null = target; node; node = node.parentElement) {
    if (canScrollBy(node, axis, contentScrollDirection)) return true;
    if (node === content) break;
  }
  return false;
}
