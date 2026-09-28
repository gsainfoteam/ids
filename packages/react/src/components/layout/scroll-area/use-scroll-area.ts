import { useCallback, useLayoutEffect, useRef, useState, type PointerEvent } from 'react';

import { debounce, noop } from 'es-toolkit';
import { focusable } from 'tabbable';

import {
  NO_THUMB,
  PAGE_FRACTION,
  barCorners,
  cornerSquareFits,
  edgeInset,
  meetingCorner,
  readShape,
  thumbAlong,
  type Axis,
  type Placement,
  type Shape,
  type ThumbLayout,
} from './geometry';

export type Overflow = Record<Axis, boolean>;

type Bar = { element: HTMLElement; placement: Placement };

type Drag = { axis: Axis; pointerId: number; from: number; scrollFrom: number; ratio: number };

const SCROLL_SETTLE_MS = 500;
const SUBPIXEL_ROUNDING = 1;
const WIDGETS_THAT_MANAGE_THEIR_OWN_FOCUS = new Set([
  'combobox',
  'grid',
  'listbox',
  'menu',
  'menubar',
  'radiogroup',
  'tablist',
  'tree',
  'treegrid',
]);

function tryCapturePointer(element: Element, pointerId: number) {
  try {
    element.setPointerCapture(pointerId);
    return true;
  } catch {
    return false;
  }
}

const along = (axis: Axis, event: { clientX: number; clientY: number }) =>
  axis === 'y' ? event.clientY : event.clientX;

const scrolledAlong = (viewport: HTMLElement, axis: Axis) =>
  axis === 'y' ? viewport.scrollTop : viewport.scrollLeft;

function scrollAlong(viewport: HTMLElement, axis: Axis, position: number) {
  if (axis === 'y') viewport.scrollTop = position;
  else viewport.scrollLeft = position;
}

function pageToward(viewport: HTMLElement, axis: Axis, thumb: HTMLElement, pointer: number) {
  const bounds = thumb.getBoundingClientRect();
  const direction = pointer < (axis === 'y' ? bounds.top : bounds.left) ? -1 : 1;

  const page = (axis === 'y' ? viewport.clientHeight : viewport.clientWidth) * PAGE_FRACTION;
  viewport.scrollBy(axis === 'y' ? { top: direction * page } : { left: direction * page });
}

function measureThumb(viewport: HTMLElement, axis: Axis, track: number) {
  return axis === 'y'
    ? thumbAlong(track, viewport.clientHeight, viewport.scrollHeight, viewport.scrollTop)
    : thumbAlong(track, viewport.clientWidth, viewport.scrollWidth, Math.abs(viewport.scrollLeft));
}

function needsTabStop(viewport: HTMLElement, overflow: Overflow) {
  if (!overflow.x && !overflow.y) return false;
  if (WIDGETS_THAT_MANAGE_THEIR_OWN_FOCUS.has(viewport.getAttribute('role') ?? '')) return false;

  return focusable(viewport, { displayCheck: 'none' }).length === 0;
}

const sameOverflow = (a: Overflow, b: Overflow) => a.x === b.x && a.y === b.y;

export function useScrollArea({ axes }: { axes: Record<Axis, boolean> }) {
  const [root, setRoot] = useState<HTMLElement | null>(null);
  const [viewport, setViewport] = useState<HTMLElement | null>(null);
  const [overflow, setOverflow] = useState<Overflow>({ x: false, y: false });
  const [hovering, setHovering] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const [dragging, setDragging] = useState<Axis | null>(null);
  const [tabStop, setTabStop] = useState(false);
  const [cornerShown, setCornerShown] = useState(false);

  const bars = useRef(new Map<Axis, Bar>());
  const thumbs = useRef<Record<Axis, ThumbLayout>>({ x: NO_THUMB, y: NO_THUMB });
  const drag = useRef<Drag | null>(null);
  const remeasure = useRef<() => void>(noop);

  const scrollsX = axes.x;
  const scrollsY = axes.y;

  useLayoutEffect(() => {
    if (!root || !viewport) return;

    const win = root.ownerDocument.defaultView!;
    const written = new WeakMap<Element, Map<string, string>>();
    let shape: Shape = readShape(root);
    let current: Overflow = { x: false, y: false };
    let frame = 0;

    const write = (element: HTMLElement, name: string, px: number) => {
      const values = written.get(element) ?? new Map<string, string>();
      written.set(element, values);

      const value = `${px}px`;
      if (values.get(name) === value) return;

      values.set(name, value);
      element.style.setProperty(name, value);
    };

    const placeBars = () => {
      for (const [axis, bar] of bars.current) {
        const crossAxis: Axis = axis === 'y' ? 'x' : 'y';
        const cross = bars.current.get(crossAxis);
        const crossShows = !!cross && current[crossAxis];
        const corners = barCorners(axis, bar.placement, shape.corners);

        const start = edgeInset(corners.start, shape, crossShows && cross.placement === 'start');
        const end = edgeInset(corners.end, shape, crossShows && cross.placement === 'end');
        const track = (axis === 'y' ? shape.height : shape.width) - start - end;
        const thumb = measureThumb(viewport, axis, track);
        thumbs.current[axis] = thumb;

        write(bar.element, '--scroll-area-inset-start', start);
        write(bar.element, '--scroll-area-inset-end', end);
        write(bar.element, '--scroll-area-thumb-size', thumb.size);
        write(
          bar.element,
          '--scroll-area-thumb-offset',
          axis === 'x' && shape.rtl ? -thumb.offset : thumb.offset,
        );
      }
    };

    const cornerFits = () => {
      const vertical = bars.current.get('y');
      const horizontal = bars.current.get('x');
      if (!vertical || !horizontal || !current.x || !current.y) return false;

      const radius = meetingCorner(vertical.placement, horizontal.placement, shape.corners);
      return cornerSquareFits(radius, shape.gap);
    };

    const measure = () => {
      shape = readShape(root);
      const next = {
        x: scrollsX && viewport.scrollWidth - viewport.clientWidth > SUBPIXEL_ROUNDING,
        y: scrollsY && viewport.scrollHeight - viewport.clientHeight > SUBPIXEL_ROUNDING,
      };
      current = sameOverflow(current, next) ? current : next;

      setOverflow((previous) => (sameOverflow(previous, current) ? previous : current));
      setTabStop(needsTabStop(viewport, current));
      setCornerShown(cornerFits());
      placeBars();
    };

    const paint = () => {
      frame = 0;
      placeBars();
    };

    const settle = debounce(() => setScrolling(false), SCROLL_SETTLE_MS);

    const onScroll = () => {
      setScrolling(true);
      settle();
      if (!frame) frame = win.requestAnimationFrame(paint);
    };

    const resize = new ResizeObserver(measure);
    const observeContent = () => {
      resize.disconnect();
      resize.observe(root);
      resize.observe(viewport);
      for (const child of viewport.children) resize.observe(child);
    };
    const children = new MutationObserver(observeContent);

    remeasure.current = measure;
    viewport.addEventListener('scroll', onScroll, { passive: true });
    children.observe(viewport, { childList: true });
    observeContent();
    measure();

    return () => {
      remeasure.current = noop;
      viewport.removeEventListener('scroll', onScroll);
      children.disconnect();
      resize.disconnect();
      settle.cancel();
      win.cancelAnimationFrame(frame);
    };
  }, [root, viewport, scrollsX, scrollsY]);

  const registerBar = useCallback((axis: Axis, element: HTMLElement, placement: Placement) => {
    bars.current.set(axis, { element, placement });
    remeasure.current();

    return () => {
      if (bars.current.get(axis)?.element === element) bars.current.delete(axis);
    };
  }, []);

  const endDrag = (event: PointerEvent<HTMLElement>) => {
    if (drag.current?.pointerId !== event.pointerId) return;

    drag.current = null;
    setDragging(null);
  };

  const scrollbarProps = (axis: Axis) => ({
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      if (event.button !== 0 || !viewport) return;

      event.preventDefault();
      const bar = event.currentTarget;
      const thumb = bar.querySelector<HTMLElement>('[data-scroll-area-thumb]');
      if (!thumb) return;

      if (!thumb.contains(event.target as Node)) {
        pageToward(viewport, axis, thumb, along(axis, event));
        return;
      }

      const { travel } = thumbs.current[axis];
      const range =
        axis === 'y'
          ? viewport.scrollHeight - viewport.clientHeight
          : viewport.scrollWidth - viewport.clientWidth;

      tryCapturePointer(bar, event.pointerId);
      drag.current = {
        axis,
        pointerId: event.pointerId,
        from: along(axis, event),
        scrollFrom: scrolledAlong(viewport, axis),
        ratio: travel > 0 ? range / travel : 0,
      };
      setDragging(axis);
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      const active = drag.current;
      if (!active || active.pointerId !== event.pointerId || !viewport) return;

      const moved = along(active.axis, event) - active.from;
      scrollAlong(viewport, active.axis, active.scrollFrom + moved * active.ratio);
    },
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
    onLostPointerCapture: endDrag,
  });

  const hoverProps = {
    onPointerEnter: (event: PointerEvent<HTMLElement>) => {
      if (event.pointerType !== 'touch') setHovering(true);
    },
    onPointerLeave: () => setHovering(false),
  };

  return {
    setRoot,
    setViewport,
    registerBar,
    overflow,
    hovering,
    scrolling,
    dragging,
    tabStop,
    cornerShown,
    hoverProps,
    scrollbarProps,
  };
}
