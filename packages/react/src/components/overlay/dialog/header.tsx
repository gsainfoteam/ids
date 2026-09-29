import { type ComponentProps } from 'react';

import { useDialogContext } from './context';
import { Slot } from '../../utility/slot';

export type DialogHeaderProps = ComponentProps<'div'> & { asChild?: boolean };

export function DialogHeader({ asChild, className, ...props }: DialogHeaderProps) {
  const { styles } = useDialogContext('Dialog.Header');
  const Root = asChild ? Slot : 'div';

  return <Root {...props} data-dialog-header="" className={styles.header({ className })} />;
}

DialogHeader.displayName = 'Dialog.Header';
