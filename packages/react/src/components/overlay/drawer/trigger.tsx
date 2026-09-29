'use client';

import { type ComponentProps } from 'react';

import { useDrawerContext } from './context';
import { mergeProps, part } from '../../../utils';

export type DrawerTriggerProps = ComponentProps<'button'> & { asChild?: boolean };

export function DrawerTrigger({ asChild, children, ...props }: DrawerTriggerProps) {
  const { drawer } = useDrawerContext('Drawer.Trigger');

  return part(
    'button',
    asChild,
    children,
    mergeProps(props, {
      ref: drawer.setTrigger,
      type: asChild ? undefined : 'button',
      'aria-haspopup': 'dialog',
      'aria-expanded': drawer.open,
      'aria-controls': drawer.open ? drawer.ids.content : undefined,
      'data-popup-open': drawer.open ? '' : undefined,
      onClick: () => drawer.setOpen(!drawer.open),
    }),
  );
}

DrawerTrigger.displayName = 'Drawer.Trigger';
