import { type ComponentProps } from 'react';

import { usePopoverContext } from './context';
import { FloatingArrow } from '../../../internal/overlay';

export type PopoverArrowProps = Omit<
  ComponentProps<'svg'>,
  'ref' | 'width' | 'height' | 'strokeWidth'
> & {
  width?: number;
  height?: number;
  strokeWidth?: number;
  tipRadius?: number;
};

export function PopoverArrow(props: PopoverArrowProps) {
  const { setArrow, anchored } = usePopoverContext('Popover.Arrow').popover;

  return (
    <FloatingArrow
      width={14}
      height={7}
      fill="var(--ids-color-surface)"
      stroke="var(--ids-color-border)"
      strokeWidth={1}
      {...props}
      ref={setArrow}
      context={anchored.context}
      data-popover-arrow=""
    />
  );
}

PopoverArrow.displayName = 'Popover.Arrow';
