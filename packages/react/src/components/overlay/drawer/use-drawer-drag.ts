import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';

import {
  axisOf,
  latchAxis,
  mayStartDrag,
  presenceAt,
  releaseTarget,
  resistedOffset,
  scrollsInstead,
  snapOffsets,
  towardClose,
  translateAlong,
  velocityOf,
  type DrawerSide,
  type Latch,
  type Point,
  type Presence,
  type Sample,
  type SnapPoint,
} from './drawer-gesture';

import type { BackgroundScale } from './background-scale';

export type UseDrawerDragOptions = {
  content: HTMLElement | null;
  backdrop: HTMLElement | null;
  handle: HTMLElement | null;
  side: DrawerSide;
  open: boolean;
  dismissible: boolean;
  snapPoints: readonly SnapPoint[] | undefined;
  activeIndex: number | null;
  onSnap: (index: number) => void;
  fadeFromIndex: number | undefined;
  background: RefObject<BackgroundScale | null>;
  close: () => void;
};

type Gesture = {
  pointerId: number;
  target: Element;
  origin: Point;
  latch: Latch;
  dragFrom: Point;
  displacement: number;
  samples: Sample[];
};

type Metrics = { size: number; viewport: number };

const DRAGGING = 'data-dragging';
const NESTED_PUSH_BACK = 16;

function tryCapturePointer(element: Element, pointerId: number) {
  try {
    element.setPointerCapture(pointerId);
  } catch {
    return;
  }
}

function selectingTextIn(content: Element) {
  const selection = content.ownerDocument.getSelection();
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) return false;

  return content.contains(selection.getRangeAt(0).commonAncestorContainer);
}

const minus = (a: Point, b: Point): Point => ({ x: a.x - b.x, y: a.y - b.y });

type Surfaces = {
  content: HTMLElement;
  backdrop: HTMLElement | null;
  background: BackgroundScale | null;
};

function paintSurfaces(
  { content, backdrop, background }: Surfaces,
  side: DrawerSide,
  offset: number,
  shown: number,
  animate: boolean,
) {
  content.style.transform = offset === 0 ? '' : translateAlong(side, offset);
  backdrop?.style.setProperty('--drawer-fade', String(shown));
  background?.set(shown, animate);
}

function letTheExitSlideFromRest(content: HTMLElement, backdrop: HTMLElement | null) {
  content.style.transform = '';
  backdrop?.style.removeProperty('--drawer-fade');
}

function fitNestedPushBack(content: HTMLElement, viewportWidth: number) {
  const scale = (viewportWidth - NESTED_PUSH_BACK) / viewportWidth;
  content.style.setProperty('--drawer-nested-scale', String(scale));
}

function markDragging(elements: ReadonlyArray<HTMLElement | null>, dragging: boolean) {
  for (const element of elements)
    if (dragging) element?.setAttribute(DRAGGING, '');
    else element?.removeAttribute(DRAGGING);
}

export function useDrawerDrag(options: UseDrawerDragOptions) {
  const { content, backdrop, handle, side, open, snapPoints, activeIndex, fadeFromIndex } = options;

  const [metrics, setMetrics] = useState<Metrics>({ size: 0, viewport: 0 });
  const [settled, setSettled] = useState(0);

  const gesture = useRef<Gesture | null>(null);
  const stopListening = useRef<(() => void) | null>(null);

  useLayoutEffect(() => {
    if (!content) return;

    const view = content.ownerDocument.defaultView!;
    const measure = () => {
      fitNestedPushBack(content, view.innerWidth);

      const vertical = axisOf(side) === 'y';
      const next = {
        size: vertical ? content.offsetHeight : content.offsetWidth,
        viewport: vertical ? view.innerHeight : view.innerWidth,
      };

      setMetrics((previous) =>
        previous.size === next.size && previous.viewport === next.viewport ? previous : next,
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    view.addEventListener('resize', measure);

    return () => {
      observer.disconnect();
      view.removeEventListener('resize', measure);
    };
  }, [content, side]);

  const offsets = snapPoints ? snapOffsets(snapPoints, metrics.size, metrics.viewport) : null;
  const snapIndex = offsets && activeIndex !== null ? activeIndex : null;
  const restOffset = offsets && snapIndex !== null ? (offsets[snapIndex] ?? 0) : 0;
  const presence: Presence = {
    size: metrics.size,
    snap: offsets ? { offsets, fadeFromIndex: fadeFromIndex ?? offsets.length - 1 } : undefined,
  };
  const openLimit = offsets ? Math.min(...offsets) : 0;

  const paint = (offset: number, animate: boolean) => {
    if (!content) return;
    const surfaces = { content, backdrop, background: options.background.current };
    paintSurfaces(surfaces, side, offset, presenceAt(offset, presence), animate);
  };

  const latest = useRef({ options, paint, offsets, snapIndex, restOffset, openLimit, metrics });
  useLayoutEffect(() => {
    latest.current = { options, paint, offsets, snapIndex, restOffset, openLimit, metrics };
  });

  useLayoutEffect(() => {
    if (!content) return;

    if (!open) {
      letTheExitSlideFromRest(content, backdrop);
      return;
    }

    if (gesture.current?.latch === 'drag') return;
    latest.current.paint(restOffset, true);
  }, [content, backdrop, open, restOffset, settled, metrics]);

  useEffect(() => {
    if (!content) return;

    const holdTheSheetInsteadOfScrolling = (event: TouchEvent) => {
      if (gesture.current?.latch === 'drag' && event.cancelable) event.preventDefault();
    };

    content.addEventListener('touchmove', holdTheSheetInsteadOfScrolling, { passive: false });
    return () => content.removeEventListener('touchmove', holdTheSheetInsteadOfScrolling);
  }, [content]);

  useEffect(() => () => stopListening.current?.(), []);

  const end = () => {
    stopListening.current?.();
    stopListening.current = null;

    const wasDragging = gesture.current?.latch === 'drag';
    gesture.current = null;
    if (!wasDragging) return;

    markDragging([content, backdrop, handle], false);
    setSettled((count) => count + 1);
  };

  const release = (event: PointerEvent) => {
    const current = gesture.current;
    if (current?.latch !== 'drag') return;

    current.samples.push({ time: event.timeStamp, position: current.displacement });

    const {
      options: now,
      offsets: currentOffsets,
      snapIndex: index,
      metrics: sized,
    } = latest.current;
    const outcome = releaseTarget({
      displacement: current.displacement,
      velocity: velocityOf(current.samples),
      size: sized.size,
      viewport: sized.viewport,
      dismissible: now.dismissible,
      snap: currentOffsets && index !== null ? { offsets: currentOffsets, index } : undefined,
    });

    if (outcome.type === 'close') now.close();
    else if (outcome.index !== null && outcome.index !== index) now.onSnap(outcome.index);
  };

  const move = (event: PointerEvent) => {
    const current = gesture.current;
    const element = latest.current.options.content;
    if (!current || !element || event.pointerId !== current.pointerId) return;

    const point = { x: event.clientX, y: event.clientY };
    const { side: towards } = latest.current.options;

    if (current.latch === 'pending') {
      const delta = minus(point, current.origin);
      const latch = latchAxis(towards, delta);
      if (latch === 'pending') return;

      if (latch === 'cross-axis' || scrollsInstead(current.target, element, towards, delta)) {
        end();
        return;
      }

      current.latch = 'drag';
      current.dragFrom = point;
      tryCapturePointer(element, event.pointerId);
      element.ownerDocument.getSelection()?.removeAllRanges();
      markDragging([element, latest.current.options.backdrop, latest.current.options.handle], true);
    }

    const displacement = towardClose(towards, minus(point, current.dragFrom));
    current.displacement = displacement;
    current.samples.push({ time: event.timeStamp, position: displacement });

    const { restOffset: rest, openLimit: limit, metrics: sized } = latest.current;
    latest.current.paint(resistedOffset(rest + displacement, limit, sized.size), false);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (!open || !content || !event.isPrimary || event.button !== 0 || gesture.current) return;
    const target = event.target as Element;
    if (!mayStartDrag({ target, content, selectingText: selectingTextIn(content) })) return;

    const origin = { x: event.clientX, y: event.clientY };
    gesture.current = {
      pointerId: event.pointerId,
      target,
      origin,
      latch: 'pending',
      dragFrom: origin,
      displacement: 0,
      samples: [],
    };

    const doc = content.ownerDocument;
    const onUp = (up: PointerEvent) => {
      if (up.pointerId !== gesture.current?.pointerId) return;
      release(up);
      end();
    };
    const onCancel = (cancel: PointerEvent) => {
      if (cancel.pointerId === gesture.current?.pointerId) end();
    };

    doc.addEventListener('pointermove', move);
    doc.addEventListener('pointerup', onUp);
    doc.addEventListener('pointercancel', onCancel);
    stopListening.current = () => {
      doc.removeEventListener('pointermove', move);
      doc.removeEventListener('pointerup', onUp);
      doc.removeEventListener('pointercancel', onCancel);
    };
  };

  const cycleSnapPoint = () => {
    if (!snapPoints || snapPoints.length < 2) return;
    options.onSnap(((activeIndex ?? 0) + 1) % snapPoints.length);
  };

  return { onPointerDown, cycleSnapPoint, cycles: !!snapPoints && snapPoints.length > 1 };
}
