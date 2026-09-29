'use client';

import { type ComponentProps } from 'react';

import { useDialogContext } from './context';
import { mergeProps, part } from '../../../utils';

export type DialogTriggerProps = ComponentProps<'button'> & { asChild?: boolean };

export function DialogTrigger({ asChild, children, ...props }: DialogTriggerProps) {
  const { dialog } = useDialogContext('Dialog.Trigger');

  return part(
    'button',
    asChild,
    children,
    mergeProps(props, {
      ref: dialog.setTrigger,
      type: asChild ? undefined : 'button',
      'aria-haspopup': 'dialog',
      'aria-expanded': dialog.open,
      'aria-controls': dialog.open ? dialog.ids.content : undefined,
      'data-popup-open': dialog.open ? '' : undefined,
      onClick: () => dialog.setOpen(!dialog.open),
    }),
  );
}

DialogTrigger.displayName = 'Dialog.Trigger';
