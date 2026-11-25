'use client';

import type { ComponentProps, MouseEvent } from 'react';

import { buttonTypeFor, mergeProps, part } from '../../../../utils';
import { useInternalPopoverContext } from '../context';
import { DEFAULT_HOVER_DELAYS } from '../hooks/use-popover';
import { useInternalPopoverTriggerDelays } from '../hooks/use-popover-trigger-delays';

export type PopoverTriggerProps = ComponentProps<'button'> & {
  asChild?: boolean;
  openDelay?: number;
  closeDelay?: number;
};

export function PopoverTrigger({
  asChild,
  openDelay = DEFAULT_HOVER_DELAYS.open,
  closeDelay = DEFAULT_HOVER_DELAYS.close,
  children,
  ...props
}: PopoverTriggerProps) {
  const { popover } = useInternalPopoverContext('Popover.Trigger');

  useInternalPopoverTriggerDelays(popover.setDelays, openDelay, closeDelay);

  return part(
    'button',
    asChild,
    children,
    mergeProps(mergeProps(props, popover.getReferenceProps()), {
      ref: popover.setTrigger,
      type: buttonTypeFor(asChild, children),
      'aria-haspopup': 'dialog',
      'aria-expanded': popover.open,
      'aria-controls': popover.open ? popover.ids.content : undefined,
      'data-popup-open': popover.open ? '' : undefined,
      onClick: (event: MouseEvent<HTMLElement>) => popover.requestFromTrigger(event.nativeEvent),
    }),
  );
}

PopoverTrigger.displayName = 'Popover.Trigger';
