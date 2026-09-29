'use client';

import { type ComponentProps } from 'react';

import { useDialogContext } from './context';
import { Slot } from '../../utility/slot';

export type DialogFooterProps = ComponentProps<'div'> & { asChild?: boolean };

export function DialogFooter({ asChild, className, ...props }: DialogFooterProps) {
  const { styles } = useDialogContext('Dialog.Footer');
  const Root = asChild ? Slot : 'div';

  return <Root {...props} data-dialog-footer="" className={styles.footer({ className })} />;
}

DialogFooter.displayName = 'Dialog.Footer';
