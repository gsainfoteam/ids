'use client';

import { useRef, type MouseEvent, type PointerEvent } from 'react';

import { isEmptyGround } from '../lib/viewer-stage';

const A_TAP_NOT_A_DRAG = 10;

export function useInternalImageViewerEmptyPress(close: () => void) {
  const pressedAt = useRef<{ x: number; y: number } | null>(null);

  const notePress = (event: PointerEvent<HTMLElement>) => {
    pressedAt.current = { x: event.clientX, y: event.clientY };
  };

  const closeOnAnEmptyPress = (event: MouseEvent<HTMLElement>) => {
    const from = pressedAt.current;
    pressedAt.current = null;
    if (!from) return;

    const travel = Math.hypot(event.clientX - from.x, event.clientY - from.y);
    const empty = isEmptyGround(event.target as Element, event.currentTarget);
    if (travel <= A_TAP_NOT_A_DRAG && empty) close();
  };

  return { notePress, closeOnAnEmptyPress };
}
