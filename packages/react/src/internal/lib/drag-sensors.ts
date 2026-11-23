'use client';

import { MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';

const POINTER_TRAVEL_BEFORE_DRAG = 4;
const TOUCH_HOLD_BEFORE_DRAG = 250;
const TOUCH_TRAVEL_ALLOWED_WHILE_HOLDING = 5;

export function useInternalDragSensors({ touch = true }: { touch?: boolean } = {}) {
  const mouse = useSensor(MouseSensor, {
    activationConstraint: { distance: POINTER_TRAVEL_BEFORE_DRAG },
  });
  const held = useSensor(TouchSensor, {
    activationConstraint: {
      delay: TOUCH_HOLD_BEFORE_DRAG,
      tolerance: TOUCH_TRAVEL_ALLOWED_WHILE_HOLDING,
    },
  });
  return useSensors(mouse, touch ? held : null);
}
