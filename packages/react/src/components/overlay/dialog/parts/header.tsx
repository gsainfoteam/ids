'use client';

import { type ComponentProps } from 'react';

import { Slot } from '../../../utility/slot';
import { useInternalDialogContext } from '../context';

export type DialogHeaderProps = ComponentProps<'div'> & { asChild?: boolean };

export function DialogHeader({ asChild, className, ...props }: DialogHeaderProps) {
  const { styles } = useInternalDialogContext('Dialog.Header');
  const Root = asChild ? Slot : 'div';

  return <Root {...props} data-dialog-header="" className={styles.header({ className })} />;
}

DialogHeader.displayName = 'Dialog.Header';
