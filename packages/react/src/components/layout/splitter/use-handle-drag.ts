'use client';

import { useRef, type PointerEvent } from 'react';

import type { SplitterOrientation } from './use-splitter';

export type HandleDragOptions = {
  orientation: SplitterOrientation;
  measure: () => { length: number; rtl: boolean } | null;
  onStart: () => void;
  onMove: (percent: number) => void;
  onEnd: () => void;
};

type Drag = { pointerId: number; origin: number; towardEnd: 1 | -1; length: number };

const PRIMARY_BUTTON = 0;

function tryCapturePointer(element: Element, pointerId: number) {
  try {
    element.setPointerCapture(pointerId);
    return true;
  } catch {
    return false;
  }
}

export function useHandleDrag({ orientation, measure, onStart, onMove, onEnd }: HandleDragOptions) {
  const drag = useRef<Drag | null>(null);
  const horizontal = orientation === 'horizontal';
  const along = (event: PointerEvent) => (horizontal ? event.clientX : event.clientY);

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.button !== PRIMARY_BUTTON || drag.current) return;
    const group = measure();
    if (!group || group.length <= 0) return;

    event.preventDefault();
    event.currentTarget.focus({ preventScroll: true });
    tryCapturePointer(event.currentTarget, event.pointerId);
    drag.current = {
      pointerId: event.pointerId,
      origin: along(event),
      towardEnd: horizontal && group.rtl ? -1 : 1,
      length: group.length,
    };
    onStart();
  };

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    const active = drag.current;
    if (!active || active.pointerId !== event.pointerId) return;
    onMove((((along(event) - active.origin) * active.towardEnd) / active.length) * 100);
  };

  const onPointerEnd = (event: PointerEvent<HTMLElement>) => {
    const active = drag.current;
    if (!active || active.pointerId !== event.pointerId) return;
    drag.current = null;
    onEnd();
  };

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: onPointerEnd,
    onPointerCancel: onPointerEnd,
    onLostPointerCapture: onPointerEnd,
  };
}
