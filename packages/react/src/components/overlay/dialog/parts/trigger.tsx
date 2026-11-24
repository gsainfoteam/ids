'use client';

import { type ComponentProps } from 'react';

import { buttonTypeFor, mergeProps, part } from '../../../../utils';
import { useInternalDialogContext } from '../context';

export type DialogTriggerProps = ComponentProps<'button'> & { asChild?: boolean };

export function DialogTrigger({ asChild, children, ...props }: DialogTriggerProps) {
  const { dialog } = useInternalDialogContext('Dialog.Trigger');

  return part(
    'button',
    asChild,
    children,
    mergeProps(props, {
      ref: dialog.setTrigger,
      type: buttonTypeFor(asChild, children),
      'aria-haspopup': 'dialog',
      'aria-expanded': dialog.open,
      'aria-controls': dialog.open ? dialog.ids.content : undefined,
      'data-popup-open': dialog.open ? '' : undefined,
      onClick: () => dialog.setOpen(!dialog.open),
    }),
  );
}

DialogTrigger.displayName = 'Dialog.Trigger';
