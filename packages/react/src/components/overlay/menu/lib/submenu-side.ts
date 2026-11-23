import type { AnchoredSide } from '../../../../internal/overlay';
import type { MenuLevel } from '../hooks/use-menu';

const continuesSideways = (side: AnchoredSide) => side === 'left' || side === 'right';

export function awayFromParent(parent: MenuLevel): AnchoredSide {
  const parentSide = parent.anchored.side;

  return parent.nested && continuesSideways(parentSide) ? parentSide : 'right';
}
