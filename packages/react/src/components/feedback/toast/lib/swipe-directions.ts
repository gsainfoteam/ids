import type { Toaster } from '..';
import type { SwipeDirections } from '../hooks/use-toast';

export function swipeDirectionsOf(placement: Toaster.Placement): SwipeDirections {
  const [side, align] = placement.split('-');

  return {
    y: side === 'top' ? -1 : 1,
    x: align === 'left' ? -1 : align === 'right' ? 1 : 0,
  };
}
