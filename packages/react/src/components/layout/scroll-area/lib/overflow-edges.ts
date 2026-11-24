import { clamp } from 'es-toolkit';

import type { Axis } from './geometry';

export type Edge = 'start' | 'end';
export type OverflowEdges = Record<Edge, number>;

export const NO_OVERFLOW_EDGES: OverflowEdges = { start: 0, end: 0 };

export const OVERFLOW_EDGE_NAMES = {
  y: {
    start: { variable: '--scroll-area-overflow-y-start', attribute: 'data-overflow-y-start' },
    end: { variable: '--scroll-area-overflow-y-end', attribute: 'data-overflow-y-end' },
  },
  x: {
    start: { variable: '--scroll-area-overflow-x-start', attribute: 'data-overflow-x-start' },
    end: { variable: '--scroll-area-overflow-x-end', attribute: 'data-overflow-x-end' },
  },
} as const satisfies Record<Axis, Record<Edge, { variable: string; attribute: string }>>;

const FRACTIONAL_SCROLL_REMAINDER = 1;

const ignoringFractionalRemainder = (distance: number) =>
  distance < FRACTIONAL_SCROLL_REMAINDER ? 0 : distance;

export function overflowEdgesAlong(viewport: HTMLElement, axis: Axis): OverflowEdges {
  const range = Math.max(
    0,
    axis === 'y'
      ? viewport.scrollHeight - viewport.clientHeight
      : viewport.scrollWidth - viewport.clientWidth,
  );
  const fromStart = clamp(
    axis === 'y' ? viewport.scrollTop : Math.abs(viewport.scrollLeft),
    0,
    range,
  );

  return {
    start: ignoringFractionalRemainder(fromStart),
    end: ignoringFractionalRemainder(range - fromStart),
  };
}

const registeredIn = new WeakSet<Window>();

function tryRegisterUninheritedLength(win: Window & typeof globalThis, name: string) {
  try {
    win.CSS.registerProperty({ name, syntax: '<length>', inherits: false, initialValue: '0px' });
    return true;
  } catch {
    return false;
  }
}

export function keepOverflowVariablesOffTheContent(win: Window & typeof globalThis) {
  if (registeredIn.has(win) || typeof win.CSS?.registerProperty !== 'function') return;

  registeredIn.add(win);
  for (const edges of Object.values(OVERFLOW_EDGE_NAMES))
    for (const { variable } of Object.values(edges)) tryRegisterUninheritedLength(win, variable);
}
