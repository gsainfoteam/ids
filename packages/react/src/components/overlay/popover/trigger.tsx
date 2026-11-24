'use client';

import { useLayoutEffect, type ComponentProps, type MouseEvent } from 'react';

import { usePopoverContext } from './context';
import { DEFAULT_HOVER_DELAYS } from './use-popover';
import { buttonTypeFor, mergeProps, part } from '../../../utils';

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
  const { popover } = usePopoverContext('Popover.Trigger');

  const { setDelays } = popover;
  useLayoutEffect(() => {
    setDelays({ open: openDelay, close: closeDelay });
  }, [setDelays, openDelay, closeDelay]);

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
