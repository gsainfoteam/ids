import type { ScrollArea } from '.';
import type { Axis } from './geometry';

export const axisOf = (orientation: ScrollArea.ScrollbarOrientation | undefined): Axis =>
  orientation === 'horizontal' ? 'x' : 'y';

export const orientationOf = (axis: Axis): ScrollArea.ScrollbarOrientation =>
  axis === 'x' ? 'horizontal' : 'vertical';
