import type { SyntheticEvent } from 'react';

import type { SchedulerPoint } from '../parts/selectable';
import type { Active } from '@dnd-kit/core';

export const SELECTION = 'scheduler-selection';

export const isTheSelection = (active: Active) => active.id === SELECTION;

export const pressesOnSomethingElse = (target: Element) =>
  target.closest('[data-scheduler-slot], button, a, input') !== null;

const holdsAModifier = (event: MouseEvent | TouchEvent) =>
  event.ctrlKey || event.metaKey || event.shiftKey || event.altKey;

export function plainPressAt(event: SyntheticEvent): SchedulerPoint | null {
  const native = event.nativeEvent as MouseEvent | TouchEvent;
  if (holdsAModifier(native)) return null;
  if ('touches' in native) {
    const [touch] = native.touches;
    return native.touches.length === 1 ? { x: touch.clientX, y: touch.clientY } : null;
  }
  return native.button === 0 ? { x: native.clientX, y: native.clientY } : null;
}
