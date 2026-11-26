import type { ScrollArea } from '..';
import type { Axis } from './geometry';

export const AXES: Record<ScrollArea.Orientation, Axis[]> = {
  vertical: ['y'],
  horizontal: ['x'],
  both: ['y', 'x'],
};

export const scrollsAlong = (axes: Record<Axis, boolean>): ScrollArea.Orientation => {
  if (axes.x && axes.y) return 'both';
  return axes.x ? 'horizontal' : 'vertical';
};

export const axisOf = (orientation: ScrollArea.ScrollbarOrientation | undefined): Axis =>
  orientation === 'horizontal' ? 'x' : 'y';

export const orientationOf = (axis: Axis): ScrollArea.ScrollbarOrientation =>
  axis === 'x' ? 'horizontal' : 'vertical';

export function fadedAlong(
  fade: ScrollArea.Fade | undefined,
  scrolls: ScrollArea.Orientation,
): ScrollArea.Orientation | undefined {
  const y = (fade === 'both' || fade === 'y') && scrolls !== 'horizontal';
  const x = (fade === 'both' || fade === 'x') && scrolls !== 'vertical';

  if (x && y) return 'both';
  if (y) return 'vertical';
  return x ? 'horizontal' : undefined;
}
