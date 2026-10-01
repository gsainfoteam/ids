'use client';

import { type ComponentProps, type MouseEvent } from 'react';

import { usePopoverContext } from './context';
import { mergeProps, part } from '../../../utils';

export type PopoverTriggerProps = ComponentProps<'button'> & { asChild?: boolean };

export function PopoverTrigger({ asChild, children, ...props }: PopoverTriggerProps) {
  const { popover } = usePopoverContext('Popover.Trigger');

  return part(
    'button',
    asChild,
    children,
    mergeProps(mergeProps(props, popover.getReferenceProps()), {
      ref: popover.setTrigger,
      type: asChild ? undefined : 'button',
      'aria-haspopup': 'dialog',
      'aria-expanded': popover.open,
      'aria-controls': popover.open ? popover.ids.content : undefined,
      'data-popup-open': popover.open ? '' : undefined,
      onClick: (event: MouseEvent<HTMLElement>) => popover.requestFromTrigger(event.nativeEvent),
    }),
  );
}

PopoverTrigger.displayName = 'Popover.Trigger';
