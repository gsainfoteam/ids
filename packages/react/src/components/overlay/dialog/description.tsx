'use client';

import { useLayoutEffect, type ComponentProps } from 'react';

import { useDialogContext } from './context';
import { Slot } from '../../utility/slot';

export type DialogDescriptionProps = ComponentProps<'p'> & { asChild?: boolean };

export function DialogDescription({ asChild, className, ...props }: DialogDescriptionProps) {
  const { styles, dialog, setDescribed } = useDialogContext('Dialog.Description');

  useLayoutEffect(() => {
    setDescribed(true);
    return () => setDescribed(false);
  }, [setDescribed]);

  const Root = asChild ? Slot : 'p';

  return (
    <Root
      id={dialog.ids.description}
      {...props}
      data-dialog-description=""
      className={styles.description({ className })}
    />
  );
}

DialogDescription.displayName = 'Dialog.Description';
