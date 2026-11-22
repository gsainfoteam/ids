'use client';

import { useEffect, useRef, useState, type PointerEvent } from 'react';

import { swallowTheClickThatEndsADrag } from '../../../internal/drag-surface';

const POINTER_TRAVEL_BEFORE_SELECTING = 4;

type Press<T> = { pointerId: number; x: number; y: number; area: HTMLElement; from: T };

export type PointerSelection<T> = { from: T; to: T };

type PointerSelectionOptions<T> = {
  areaOf: (target: Element) => HTMLElement | null;
  valueAt: (area: HTMLElement, x: number, y: number) => T | null;
  onSelect: ((selection: PointerSelection<T>) => void) | undefined;
};

const pressesOnSomethingElse = (target: Element) =>
  target.closest('[data-scheduler-slot], button, a, input') !== null;

const isAPlainPress = (event: PointerEvent) =>
  event.button === 0 &&
  event.pointerType !== 'touch' &&
  !event.ctrlKey &&
  !event.metaKey &&
  !event.shiftKey &&
  !event.altKey;

function tryCapturePointer(element: HTMLElement, pointerId: number) {
  try {
    element.setPointerCapture(pointerId);
  } catch {
    return;
  }
}

export function usePointerSelection<T>({ areaOf, valueAt, onSelect }: PointerSelectionOptions<T>) {
  const press = useRef<Press<T> | null>(null);
  const [selection, setSelection] = useState<PointerSelection<T> | null>(null);
  const selecting = selection !== null;

  useEffect(() => {
    if (!selecting) return;
    const cancelOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      press.current = null;
      setSelection(null);
    };
    window.addEventListener('keydown', cancelOnEscape, true);
    return () => window.removeEventListener('keydown', cancelOnEscape, true);
  }, [selecting]);

  const end = () => {
    press.current = null;
    setSelection(null);
  };

  const selectionAt = (pressed: Press<T>, event: PointerEvent) => ({
    from: pressed.from,
    to: valueAt(pressed.area, event.clientX, event.clientY) ?? selection?.to ?? pressed.from,
  });

  if (!onSelect) return { selection: null, handlers: {} };

  return {
    selection,
    handlers: {
      onPointerDown: (event: PointerEvent<HTMLElement>) => {
        if (!isAPlainPress(event) || !(event.target instanceof Element)) return;
        if (pressesOnSomethingElse(event.target)) return;
        const area = areaOf(event.target);
        const from = area && valueAt(area, event.clientX, event.clientY);
        if (!area || from === null) return;
        event.preventDefault();
        tryCapturePointer(event.currentTarget, event.pointerId);
        press.current = {
          pointerId: event.pointerId,
          x: event.clientX,
          y: event.clientY,
          area,
          from,
        };
      },
      onPointerMove: (event: PointerEvent<HTMLElement>) => {
        const pressed = press.current;
        if (!pressed || pressed.pointerId !== event.pointerId) return;
        const travel = Math.hypot(event.clientX - pressed.x, event.clientY - pressed.y);
        if (!selecting && travel < POINTER_TRAVEL_BEFORE_SELECTING) return;
        setSelection(selectionAt(pressed, event));
      },
      onPointerUp: (event: PointerEvent<HTMLElement>) => {
        const pressed = press.current;
        if (!pressed || pressed.pointerId !== event.pointerId) return;
        end();
        if (!selecting) return;
        swallowTheClickThatEndsADrag();
        onSelect(selectionAt(pressed, event));
      },
      onPointerCancel: end,
      onLostPointerCapture: (event: PointerEvent<HTMLElement>) => {
        if (press.current?.pointerId === event.pointerId) end();
      },
    },
  };
}
