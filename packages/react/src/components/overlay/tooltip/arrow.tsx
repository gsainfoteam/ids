import { type ComponentProps, type CSSProperties } from 'react';

import { useTooltipContext } from './context';

import type { AnchoredSide } from '../../../internal/overlay';

export type TooltipArrowProps = Omit<ComponentProps<'span'>, 'children'>;

const ARROW_HALF = 4;

const ARROW_EDGE: Record<AnchoredSide, AnchoredSide> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

export function TooltipArrow({ className, style, ...props }: TooltipArrowProps) {
  const { tooltip, styles } = useTooltipContext('Tooltip.Arrow');
  const { arrowPosition, side, setArrow } = tooltip;

  const placed: CSSProperties = {
    left: arrowPosition?.x,
    top: arrowPosition?.y,
    [ARROW_EDGE[side]]: -ARROW_HALF,
  };

  return (
    <span
      aria-hidden="true"
      {...props}
      ref={setArrow}
      data-tooltip-arrow=""
      className={styles.arrow({ className })}
      style={{ ...placed, ...style }}
    />
  );
}

TooltipArrow.displayName = 'Tooltip.Arrow';
