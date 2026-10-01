import type { ScrollArea } from '.';
import type { Axis } from './geometry';

export const axisOf = (orientation: ScrollArea.ScrollbarOrientation | undefined): Axis =>
  orientation === 'horizontal' ? 'x' : 'y';

export const orientationOf = (axis: Axis): ScrollArea.ScrollbarOrientation =>
  axis === 'x' ? 'horizontal' : 'vertical';

export function fadedAlong(
  fade: ScrollArea.Fade,
  scrolls: ScrollArea.Orientation,
): ScrollArea.Orientation | undefined {
  const y = (fade === true || fade === 'y') && scrolls !== 'horizontal';
  const x = (fade === true || fade === 'x') && scrolls !== 'vertical';

  if (x && y) return 'both';
  if (y) return 'vertical';
  return x ? 'horizontal' : undefined;
}
