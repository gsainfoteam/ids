'use client';

import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from 'react';

import { matchesKeyboardEvent } from '@tanstack/react-hotkeys';

import { holdResizeCursor, isRightToLeft } from './measure';
import { tryCapturePointer } from '../../utils';
import { isComposingKey, keyWithModifiers } from '../keys';

export type ResizeDragAxes = 'inline' | 'block' | 'both';

export type ResizeDelta = { inline: number; block: number };

export type UseResizeDragOptions = {
  axes: ResizeDragAxes;
  disabled?: boolean;
  onStart: () => void;
  onMove: (delta: ResizeDelta) => void;
  onEnd: (delta: ResizeDelta) => void;
  onCancel: () => void;
  onReset?: () => void;
  onDraggingChange?: (dragging: boolean) => void;
};

type Point = { x: number; y: number };

type Drag = {
  pointerId: number;
  from: Point;
  to: Point;
  rtl: boolean;
  frame: number;
  release: () => void;
};

const ESCAPE_WITH_ANY_MODIFIERS = keyWithModifiers('Escape');

const CURSOR_ALONG = { inline: 'ew-resize', block: 'ns-resize' } as const;

const cursorFor = (axes: ResizeDragAxes, rtl: boolean) => {
  if (axes !== 'both') return CURSOR_ALONG[axes];
  return rtl ? 'nesw-resize' : 'nwse-resize';
};

const deltaOf = ({ from, to, rtl }: Drag): ResizeDelta => ({
  inline: rtl ? from.x - to.x : to.x - from.x,
  block: to.y - from.y,
});

const hasMoved = ({ from, to }: Drag) => from.x !== to.x || from.y !== to.y;

export function useResizeDrag(options: UseResizeDragOptions) {
  const [dragging, setDragging] = useState(false);
  const drag = useRef<Drag | null>(null);
  const latest = useRef(options);

  useLayoutEffect(() => {
    latest.current = options;
  });

  const stop = (commit: boolean) => {
    const active = drag.current;
    if (!active) return;

    drag.current = null;
    active.release();
    if (commit && hasMoved(active)) latest.current.onEnd(deltaOf(active));
    else latest.current.onCancel();
    setDragging(false);
    latest.current.onDraggingChange?.(false);
  };

  useEffect(
    () => () => {
      const active = drag.current;
      if (!active) return;
      drag.current = null;
      active.release();
      latest.current.onCancel();
    },
    [],
  );

  const endWith = (event: PointerEvent<HTMLElement>) => {
    if (drag.current?.pointerId === event.pointerId) stop(true);
  };

  return {
    dragging,
    dragProps: {
      'data-resize-handle': '',
      'data-dragging': dragging ? '' : undefined,
      onPointerDown: (event: PointerEvent<HTMLElement>) => {
        if (latest.current.disabled || event.button !== 0 || drag.current) return;

        event.preventDefault();
        const element = event.currentTarget;
        const win = element.ownerDocument.defaultView!;
        const { pointerId } = event;
        const rtl = isRightToLeft(element);

        const cancelOnEscape = (key: KeyboardEvent) => {
          const escape = ESCAPE_WITH_ANY_MODIFIERS.some((hotkey) =>
            matchesKeyboardEvent(key, hotkey),
          );
          if (!escape || isComposingKey(key)) return;
          key.preventDefault();
          stop(false);
        };

        tryCapturePointer(element, pointerId);
        const releaseCursor = holdResizeCursor(
          element.ownerDocument,
          cursorFor(latest.current.axes, rtl),
        );
        win.addEventListener('keydown', cancelOnEscape, true);

        const active: Drag = {
          pointerId,
          from: { x: event.clientX, y: event.clientY },
          to: { x: event.clientX, y: event.clientY },
          rtl,
          frame: 0,
          release: () => {
            win.cancelAnimationFrame(active.frame);
            win.removeEventListener('keydown', cancelOnEscape, true);
            releaseCursor();
            if (element.hasPointerCapture(pointerId)) element.releasePointerCapture(pointerId);
          },
        };
        drag.current = active;
        latest.current.onStart();
        setDragging(true);
        latest.current.onDraggingChange?.(true);
      },
      onPointerMove: (event: PointerEvent<HTMLElement>) => {
        const active = drag.current;
        if (!active || active.pointerId !== event.pointerId) return;

        active.to = { x: event.clientX, y: event.clientY };
        if (active.frame) return;

        active.frame = event.currentTarget.ownerDocument.defaultView!.requestAnimationFrame(() => {
          active.frame = 0;
          if (drag.current === active) latest.current.onMove(deltaOf(active));
        });
      },
      onPointerUp: (event: PointerEvent<HTMLElement>) => {
        const active = drag.current;
        if (active?.pointerId === event.pointerId)
          active.to = { x: event.clientX, y: event.clientY };
        endWith(event);
      },
      onPointerCancel: endWith,
      onLostPointerCapture: endWith,
      onDoubleClick: () => {
        if (!latest.current.disabled) latest.current.onReset?.();
      },
    },
  };
}
