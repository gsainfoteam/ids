import type { KeyboardEvent as ReactKeyboardEvent } from 'react';

import { clamp } from 'es-toolkit';

import {
  DRAG_THRESHOLD,
  latchAxis,
  presenceAt,
  releaseTarget,
  resistedOffset,
  velocityOf,
  type Sample,
} from '../../components/overlay/drawer/drawer-gesture';
import { isComposingKey, keyHandler } from '../keys';
import { motionDuration, prefersReducedMotion, SHEET_EASING } from '../motion';
import {
  AREA_CENTER,
  clampPan,
  coast,
  distanceOf,
  FITTED,
  KEYBOARD_PAN_STEP,
  midpointOf,
  MIN_MOMENTUM_SPEED,
  MIN_SCALE,
  MOMENTUM_TIME,
  pinchView,
  roundScale,
  sameView,
  settle,
  transformOf,
  viewOfMatrix,
  wheelZoomFactor,
  ZOOM_STEP,
  zoomAround,
  type PinchStart,
  type Point,
  type Size,
  type View,
} from './math';

export type ZoomPanSettings = {
  maxScale: number;
  onCommit: (scale: number) => void;
  onSwipe?: (presence: number, dragging: boolean) => void;
  onSwipeClose?: () => void;
  onPinchStart?: () => void;
};

export type ZoomPanOptions = {
  scale: number;
  read: () => ZoomPanSettings;
};

export type ZoomPan = {
  isZoomed: () => boolean;
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
  zoomTo: (scale: number, around?: Point) => void;
  follow: (scale: number) => void;
  onKeyDown: (event: ReactKeyboardEvent<Element>) => boolean;
  dispose: () => void;
};

type Tracked = Point & { type: string };

type Measured = { center: Point; ratio: number; area: Size; content: Size };

type Pending = { kind: 'pending'; pointerId: number; pointerType: string; origin: Point };

type Pan = {
  kind: 'pan';
  pointerId: number;
  pointerType: string;
  origin: Point;
  from: View;
  travel: number;
  xs: Sample[];
  ys: Sample[];
};

type Swipe = {
  kind: 'swipe';
  pointerId: number;
  from: Point;
  displacement: number;
  samples: Sample[];
};

type Pinch = { kind: 'pinch'; ids: readonly [number, number]; start: PinchStart; midpoint: Point };

type LeftToTheTrack = { kind: 'left-to-the-track'; pointerId: number };

type Gesture = Pending | Pan | Swipe | Pinch | LeftToTheTrack;

type Tap = { time: number; point: Point; pointerType: string };

type Motion = 'instant' | 'settle' | 'coast';

type SafariGestureEvent = Event & { scale: number; clientX: number; clientY: number };

const PRIMARY_BUTTON = 0;
const SWIPE_CLOSES_DOWNWARD = 'bottom';
const TAP_SLOP = DRAG_THRESHOLD;
const DOUBLE_TAP_WINDOW = 300;
const DOUBLE_CLICK_WINDOW = 500;
const DOUBLE_TAP_REACH = 25;
const COAST_DURATION = MOMENTUM_TIME * 3;
const COAST_EASING = 'cubic-bezier(0.16, 0.48, 0.3, 1)';

const ZOOM_KEYS = { '+': 'in', '=': 'in', '-': 'out', '0': 'reset' } as const;

type ZoomKey = (typeof ZOOM_KEYS)[keyof typeof ZOOM_KEYS];

function zoomKeyOf(event: ReactKeyboardEvent<Element>): ZoomKey | undefined {
  if (event.defaultPrevented || isComposingKey(event.nativeEvent)) return undefined;
  if (event.ctrlKey || event.metaKey || event.altKey) return undefined;

  return ZOOM_KEYS[event.key as keyof typeof ZOOM_KEYS];
}

const pointOf = (event: { clientX: number; clientY: number }): Point => ({
  x: event.clientX,
  y: event.clientY,
});

const refuse = (event: Event) => event.preventDefault();

function tryCapturePointer(element: Element, pointerId: number) {
  try {
    element.setPointerCapture(pointerId);
  } catch {
    return;
  }
}

const movesTheView = (gesture: Gesture | null) =>
  gesture?.kind === 'pan' || gesture?.kind === 'swipe' || gesture?.kind === 'pinch';

export function createZoomPan(
  element: HTMLElement,
  content: HTMLElement,
  { scale: initialScale, read }: ZoomPanOptions,
): ZoomPan {
  const doc = element.ownerDocument;
  const pointers = new Map<number, Tracked>();
  const restoreStyle = {
    touchAction: element.style.touchAction,
    userSelect: element.style.userSelect,
    webkitUserSelect: element.style.getPropertyValue('-webkit-user-select'),
  };

  let view: View = FITTED;
  let committed = roundScale(initialScale);
  let running: Animation | null = null;
  let gesture: Gesture | null = null;
  let safariPinchFrom: View | null = null;
  let lastTap: Tap | null = null;
  let listening = false;

  const measure = (): Measured => {
    const rect = element.getBoundingClientRect();
    const ratio = element.offsetWidth > 0 ? rect.width / element.offsetWidth : 1;

    return {
      center: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
      ratio: ratio || 1,
      area: { width: element.clientWidth, height: element.clientHeight },
      content: { width: content.offsetWidth, height: content.offsetHeight },
    };
  };

  const toArea = (measured: Measured, point: Point): Point => ({
    x: (point.x - measured.center.x) / measured.ratio,
    y: (point.y - measured.center.y) / measured.ratio,
  });

  const paint = (next: View) => {
    view = next;
    content.style.transform = transformOf(next);
  };

  const liveView = (): View => {
    if (running?.playState !== 'running') return view;

    const transform = getComputedStyle(content).transform;
    return transform === 'none' ? FITTED : viewOfMatrix(new DOMMatrixReadOnly(transform));
  };

  const stopAtLiveView = () => {
    const live = liveView();
    running?.cancel();
    running = null;
    paint(live);
    return live;
  };

  const moveTo = (target: View, motion: Motion) => {
    const from = liveView();
    running?.cancel();
    running = null;
    paint(target);

    if (motion === 'instant' || sameView(from, target) || prefersReducedMotion(content)) return;

    running = content.animate(
      [{ transform: transformOf(from) || 'none' }, { transform: transformOf(target) || 'none' }],
      motion === 'coast'
        ? { duration: COAST_DURATION, easing: COAST_EASING }
        : { duration: motionDuration(content, 'normal'), easing: SHEET_EASING },
    );
  };

  const commit = (scale: number) => {
    const rounded = roundScale(scale);
    if (rounded === committed) return;

    committed = rounded;
    read().onCommit(rounded);
  };

  const zoomToward = (scale: number, clientPoint: Point | null, motion: Motion) => {
    const measured = measure();
    const around = clientPoint ? toArea(measured, clientPoint) : AREA_CENTER;
    const target = clamp(scale, MIN_SCALE, read().maxScale);
    const next = clampPan(zoomAround(view, target, around), measured.content, measured.area);

    moveTo(next, motion);
    commit(next.scale);
  };

  const panBy = (dx: number, dy: number) => {
    if (view.scale <= MIN_SCALE) return false;

    const measured = measure();
    const next = clampPan(
      { scale: view.scale, x: view.x + dx, y: view.y + dy },
      measured.content,
      measured.area,
    );
    moveTo(next, 'settle');
  };

  const tap = (point: Point, time: number, pointerType: string) => {
    const previous = lastTap;
    const window = pointerType === 'mouse' ? DOUBLE_CLICK_WINDOW : DOUBLE_TAP_WINDOW;
    const secondTap =
      previous !== null &&
      previous.pointerType === pointerType &&
      time - previous.time <= window &&
      distanceOf(previous.point, point) <= DOUBLE_TAP_REACH;

    if (!secondTap) {
      lastTap = { time, point, pointerType };
      return;
    }

    lastTap = null;
    zoomToward(view.scale > MIN_SCALE ? MIN_SCALE : ZOOM_STEP, point, 'settle');
  };

  const startPinch = () => {
    const [first, second] = [...pointers.entries()];
    if (!first || !second) return;

    if (gesture?.kind === 'swipe') read().onSwipe?.(1, false);
    lastTap = null;

    const measured = measure();
    const midpoint = toArea(measured, midpointOf(first[1], second[1]));
    const distance = distanceOf(first[1], second[1]) / measured.ratio;

    gesture = {
      kind: 'pinch',
      ids: [first[0], second[0]],
      start: { view: stopAtLiveView(), midpoint, distance },
      midpoint,
    };
    read().onPinchStart?.();
  };

  const movePinch = (pinch: Pinch) => {
    const a = pointers.get(pinch.ids[0]);
    const b = pointers.get(pinch.ids[1]);
    if (!a || !b) return;

    const measured = measure();
    pinch.midpoint = toArea(measured, midpointOf(a, b));
    paint(
      pinchView(pinch.start, pinch.midpoint, distanceOf(a, b) / measured.ratio, read().maxScale),
    );
  };

  const finishPinch = (pinch: Pinch) => {
    const measured = measure();
    const target = settle(view, pinch.midpoint, measured.content, measured.area, read().maxScale);

    moveTo(target, 'settle');
    commit(target.scale);
  };

  const movePan = (pan: Pan, event: PointerEvent) => {
    const measured = measure();
    const dx = (event.clientX - pan.origin.x) / measured.ratio;
    const dy = (event.clientY - pan.origin.y) / measured.ratio;
    const next = clampPan(
      { scale: pan.from.scale, x: pan.from.x + dx, y: pan.from.y + dy },
      measured.content,
      measured.area,
    );

    pan.travel = Math.max(pan.travel, Math.hypot(dx, dy));
    pan.xs.push({ time: event.timeStamp, position: next.x });
    pan.ys.push({ time: event.timeStamp, position: next.y });
    paint(next);
  };

  const finishPan = (pan: Pan, event: PointerEvent, cancelled: boolean) => {
    if (!cancelled && pan.travel < TAP_SLOP) {
      commit(view.scale);
      tap(pointOf(event), event.timeStamp, pan.pointerType);
      return;
    }

    lastTap = null;
    pan.xs.push({ time: event.timeStamp, position: view.x });
    pan.ys.push({ time: event.timeStamp, position: view.y });

    const velocity = { x: velocityOf(pan.xs), y: velocityOf(pan.ys) };
    const flung = Math.hypot(velocity.x, velocity.y) >= MIN_MOMENTUM_SPEED;
    if (!cancelled && flung && !prefersReducedMotion(content)) {
      const measured = measure();
      moveTo(coast(view, velocity, measured.content, measured.area), 'coast');
    }

    commit(view.scale);
  };

  const moveSwipe = (swipe: Swipe, event: PointerEvent) => {
    const measured = measure();
    const displacement = (event.clientY - swipe.from.y) / measured.ratio;
    const offset = resistedOffset(displacement, 0, measured.area.height);

    swipe.displacement = displacement;
    swipe.samples.push({ time: event.timeStamp, position: displacement });
    paint({ scale: MIN_SCALE, x: 0, y: offset });
    read().onSwipe?.(presenceAt(offset, { size: measured.area.height }), true);
  };

  const finishSwipe = (swipe: Swipe, event: PointerEvent, cancelled: boolean) => {
    swipe.samples.push({ time: event.timeStamp, position: swipe.displacement });

    const measured = measure();
    const closes =
      !cancelled &&
      releaseTarget({
        displacement: swipe.displacement,
        velocity: velocityOf(swipe.samples),
        size: measured.area.height,
        viewport: measured.area.height,
        dismissible: true,
      }).type === 'close';

    if (closes) {
      read().onSwipeClose?.();
      return;
    }

    moveTo(clampPan(FITTED, measured.content, measured.area), 'settle');
    read().onSwipe?.(1, false);
  };

  const latch = (pending: Pending, event: PointerEvent) => {
    const measured = measure();
    const point = pointOf(event);
    const delta = {
      x: (point.x - pending.origin.x) / measured.ratio,
      y: (point.y - pending.origin.y) / measured.ratio,
    };

    if (view.scale > MIN_SCALE) {
      const pan: Pan = {
        kind: 'pan',
        pointerId: pending.pointerId,
        pointerType: pending.pointerType,
        origin: pending.origin,
        from: stopAtLiveView(),
        travel: 0,
        xs: [],
        ys: [],
      };
      gesture = pan;
      tryCapturePointer(element, pending.pointerId);
      movePan(pan, event);
      return;
    }

    const axis = latchAxis(SWIPE_CLOSES_DOWNWARD, delta);
    if (axis === 'pending') return;

    lastTap = null;
    if (axis === 'cross-axis' || !read().onSwipeClose) {
      gesture = { kind: 'left-to-the-track', pointerId: pending.pointerId };
      return;
    }

    stopAtLiveView();
    gesture = {
      kind: 'swipe',
      pointerId: pending.pointerId,
      from: point,
      displacement: 0,
      samples: [{ time: event.timeStamp, position: 0 }],
    };
    tryCapturePointer(element, pending.pointerId);
  };

  const onPointerMove = (event: PointerEvent) => {
    const tracked = pointers.get(event.pointerId);
    if (!tracked) return;

    pointers.set(event.pointerId, { ...pointOf(event), type: tracked.type });
    if (!gesture) return;

    if (gesture.kind === 'pinch') {
      movePinch(gesture);
      return;
    }

    if (event.pointerId !== gesture.pointerId) return;

    if (gesture.kind === 'pending') latch(gesture, event);
    else if (gesture.kind === 'pan') movePan(gesture, event);
    else if (gesture.kind === 'swipe') moveSwipe(gesture, event);
  };

  const continueWithTheFingerLeft = () => {
    const [remaining] = [...pointers.entries()];
    gesture = remaining
      ? {
          kind: 'pending',
          pointerId: remaining[0],
          pointerType: remaining[1].type,
          origin: { x: remaining[1].x, y: remaining[1].y },
        }
      : null;
  };

  const onPointerEnd = (event: PointerEvent) => {
    if (!pointers.delete(event.pointerId)) return;
    if (pointers.size === 0) stopListeningToDocument();

    const ended = gesture;
    if (!ended) return;

    const cancelled = event.type === 'pointercancel';

    if (ended.kind === 'pinch') {
      if (!ended.ids.includes(event.pointerId)) return;
      finishPinch(ended);
      continueWithTheFingerLeft();
      return;
    }

    if (event.pointerId !== ended.pointerId) return;
    gesture = null;

    if (ended.kind === 'pending' && !cancelled)
      tap(pointOf(event), event.timeStamp, ended.pointerType);
    else if (ended.kind === 'pan') finishPan(ended, event, cancelled);
    else if (ended.kind === 'swipe') finishSwipe(ended, event, cancelled);
  };

  function listenToDocument() {
    if (listening) return;
    listening = true;
    doc.addEventListener('pointermove', onPointerMove);
    doc.addEventListener('pointerup', onPointerEnd);
    doc.addEventListener('pointercancel', onPointerEnd);
  }

  function stopListeningToDocument() {
    if (!listening) return;
    listening = false;
    doc.removeEventListener('pointermove', onPointerMove);
    doc.removeEventListener('pointerup', onPointerEnd);
    doc.removeEventListener('pointercancel', onPointerEnd);
  }

  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType === 'mouse' && event.button !== PRIMARY_BUTTON) return;

    pointers.set(event.pointerId, { ...pointOf(event), type: event.pointerType });
    listenToDocument();

    if (pointers.size === 1) {
      gesture = {
        kind: 'pending',
        pointerId: event.pointerId,
        pointerType: event.pointerType,
        origin: pointOf(event),
      };
      return;
    }

    if (pointers.size === 2) startPinch();
  };

  const onWheel = (event: WheelEvent) => {
    event.preventDefault();
    if (movesTheView(gesture)) return;

    lastTap = null;
    zoomToward(
      view.scale * wheelZoomFactor(event.deltaY, event.deltaMode),
      pointOf(event),
      'instant',
    );
  };

  const onSafariPinchStart = (event: Event) => {
    event.preventDefault();
    if (pointers.size > 0) return;

    safariPinchFrom = stopAtLiveView();
  };

  const onSafariPinchChange = (event: Event) => {
    event.preventDefault();
    if (pointers.size > 0 || !safariPinchFrom) return;

    const { scale, clientX, clientY } = event as SafariGestureEvent;
    const measured = measure();
    const target = clamp(safariPinchFrom.scale * scale, MIN_SCALE, read().maxScale);
    const around = toArea(measured, { x: clientX, y: clientY });

    paint(clampPan(zoomAround(view, target, around), measured.content, measured.area));
  };

  const onSafariPinchEnd = (event: Event) => {
    event.preventDefault();
    if (!safariPinchFrom) return;

    safariPinchFrom = null;
    commit(view.scale);
  };

  const keepInsideAfterResize = () => {
    if (movesTheView(gesture) || safariPinchFrom) return;

    const measured = measure();
    const next = clampPan(view, measured.content, measured.area);
    if (!sameView(next, view)) moveTo(next, 'instant');
  };

  const resizes =
    typeof ResizeObserver === 'function' ? new ResizeObserver(keepInsideAfterResize) : null;

  element.style.touchAction = 'none';
  element.style.userSelect = 'none';
  element.style.setProperty('-webkit-user-select', 'none');
  element.addEventListener('pointerdown', onPointerDown);
  element.addEventListener('wheel', onWheel, { passive: false });
  element.addEventListener('gesturestart', onSafariPinchStart);
  element.addEventListener('gesturechange', onSafariPinchChange);
  element.addEventListener('gestureend', onSafariPinchEnd);
  element.addEventListener('dragstart', refuse);
  resizes?.observe(element);
  resizes?.observe(content);

  const opening = measure();
  paint(
    clampPan(
      zoomAround(FITTED, clamp(initialScale, MIN_SCALE, read().maxScale), AREA_CENTER),
      opening.content,
      opening.area,
    ),
  );

  return {
    isZoomed: () => gesture?.kind === 'pinch' || safariPinchFrom !== null || view.scale > MIN_SCALE,
    zoomIn: () => zoomToward(view.scale * ZOOM_STEP, null, 'settle'),
    zoomOut: () => zoomToward(view.scale / ZOOM_STEP, null, 'settle'),
    reset: () => zoomToward(MIN_SCALE, null, 'settle'),
    zoomTo: (scale, around) => zoomToward(scale, around ?? null, 'settle'),
    follow: (scale) => {
      committed = roundScale(scale);
      if (movesTheView(gesture) || safariPinchFrom) return;
      if (roundScale(view.scale) === committed) return;

      const measured = measure();
      const target = clamp(scale, MIN_SCALE, read().maxScale);
      moveTo(
        clampPan(zoomAround(view, target, AREA_CENTER), measured.content, measured.area),
        'settle',
      );
    },
    onKeyDown: (event) => {
      const zoomKey = zoomKeyOf(event);
      if (zoomKey) {
        if (zoomKey === 'in') zoomToward(view.scale * ZOOM_STEP, null, 'settle');
        else if (zoomKey === 'out') zoomToward(view.scale / ZOOM_STEP, null, 'settle');
        else zoomToward(MIN_SCALE, null, 'settle');
        event.preventDefault();
        return true;
      }

      return keyHandler<Element>({
        ArrowLeft: () => panBy(KEYBOARD_PAN_STEP, 0),
        ArrowRight: () => panBy(-KEYBOARD_PAN_STEP, 0),
        ArrowUp: () => panBy(0, KEYBOARD_PAN_STEP),
        ArrowDown: () => panBy(0, -KEYBOARD_PAN_STEP),
      })(event);
    },
    dispose: () => {
      element.removeEventListener('pointerdown', onPointerDown);
      element.removeEventListener('wheel', onWheel);
      element.removeEventListener('gesturestart', onSafariPinchStart);
      element.removeEventListener('gesturechange', onSafariPinchChange);
      element.removeEventListener('gestureend', onSafariPinchEnd);
      element.removeEventListener('dragstart', refuse);
      stopListeningToDocument();
      resizes?.disconnect();
      running?.cancel();
      running = null;
      pointers.clear();
      gesture = null;
      content.style.transform = '';
      element.style.touchAction = restoreStyle.touchAction;
      element.style.userSelect = restoreStyle.userSelect;
      element.style.setProperty('-webkit-user-select', restoreStyle.webkitUserSelect);
    },
  };
}
