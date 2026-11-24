import { clamp } from 'es-toolkit';

export type Point = { x: number; y: number };

export type Size = { width: number; height: number };

export type View = { scale: number; x: number; y: number };

export type PinchStart = { view: View; midpoint: Point; distance: number };

export const FITTED: View = { scale: 1, x: 0, y: 0 };

export const AREA_CENTER: Point = { x: 0, y: 0 };

export const MIN_SCALE = 1;
export const DEFAULT_MAX_SCALE = 4;
export const ZOOM_STEP = 2;
export const KEYBOARD_PAN_STEP = 50;

export const MOMENTUM_TIME = 325;
export const MIN_MOMENTUM_SPEED = 0.1;

const BELOW_MIN_FRICTION = 0.15;
const ABOVE_MAX_FRICTION = 0.05;

const DOM_DELTA_LINE = 1;
const DOM_DELTA_PAGE = 2;
const WHEEL_ZOOM_PER_PIXEL = 0.002;
const WHEEL_ZOOM_PER_LINE = 0.05;
const WHEEL_ZOOM_PER_PAGE = 1;

const SCALE_PRECISION = 1000;
const SAME_POSITION = 0.01;

export const roundScale = (scale: number) => Math.round(scale * SCALE_PRECISION) / SCALE_PRECISION;

export const midpointOf = (a: Point, b: Point): Point => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
});

export const distanceOf = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

export const sameView = (a: View, b: View) =>
  Math.abs(a.scale - b.scale) < 1 / SCALE_PRECISION &&
  Math.abs(a.x - b.x) < SAME_POSITION &&
  Math.abs(a.y - b.y) < SAME_POSITION;

export function panLimit(scale: number, content: Size, area: Size): Point {
  return {
    x: Math.max(0, (scale * content.width - area.width) / 2),
    y: Math.max(0, (scale * content.height - area.height) / 2),
  };
}

const centeredWhenNarrower = (offset: number, limit: number) =>
  limit === 0 ? 0 : clamp(offset, -limit, limit);

export function clampPan(view: View, content: Size, area: Size): View {
  const limit = panLimit(view.scale, content, area);
  return {
    scale: view.scale,
    x: centeredWhenNarrower(view.x, limit.x),
    y: centeredWhenNarrower(view.y, limit.y),
  };
}

export function zoomAround(view: View, scale: number, around: Point): View {
  const factor = scale / view.scale;
  return {
    scale,
    x: around.x - (around.x - view.x) * factor,
    y: around.y - (around.y - view.y) * factor,
  };
}

export function wheelZoomFactor(deltaY: number, deltaMode: number) {
  const perUnit =
    deltaMode === DOM_DELTA_LINE
      ? WHEEL_ZOOM_PER_LINE
      : deltaMode === DOM_DELTA_PAGE
        ? WHEEL_ZOOM_PER_PAGE
        : WHEEL_ZOOM_PER_PIXEL;
  return 2 ** (-deltaY * perUnit);
}

function resistBeyondLimits(scale: number, maxScale: number) {
  if (scale < MIN_SCALE) return MIN_SCALE - (MIN_SCALE - scale) * BELOW_MIN_FRICTION;
  if (scale > maxScale) return maxScale + (scale - maxScale) * ABOVE_MAX_FRICTION;
  return scale;
}

export function pinchView(
  start: PinchStart,
  midpoint: Point,
  distance: number,
  maxScale: number,
): View {
  const spread = start.distance > 0 ? distance / start.distance : 1;
  const scale = resistBeyondLimits(start.view.scale * spread, maxScale);
  const factor = scale / start.view.scale;

  return {
    scale,
    x: midpoint.x - (start.midpoint.x - start.view.x) * factor,
    y: midpoint.y - (start.midpoint.y - start.view.y) * factor,
  };
}

export function settle(
  view: View,
  around: Point,
  content: Size,
  area: Size,
  maxScale: number,
): View {
  const scale = clamp(view.scale, MIN_SCALE, maxScale);
  const zoomed = scale === view.scale ? view : zoomAround(view, scale, around);
  return clampPan(zoomed, content, area);
}

export function coast(view: View, velocity: Point, content: Size, area: Size): View {
  return clampPan(
    {
      scale: view.scale,
      x: view.x + velocity.x * MOMENTUM_TIME,
      y: view.y + velocity.y * MOMENTUM_TIME,
    },
    content,
    area,
  );
}

export function transformOf(view: View) {
  if (sameView(view, FITTED)) return '';
  return `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.scale})`;
}

export const viewOfMatrix = (matrix: { a: number; e: number; f: number }): View => ({
  scale: matrix.a,
  x: matrix.e,
  y: matrix.f,
});
