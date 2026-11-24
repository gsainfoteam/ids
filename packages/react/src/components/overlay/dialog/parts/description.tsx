'use client';

import { useLayoutEffect, type ComponentProps } from 'react';

import { Slot } from '../../../utility/slot';
import { useInternalDialogContext } from '../context';

export type DialogDescriptionProps = ComponentProps<'p'> & { asChild?: boolean };

export function DialogDescription({ asChild, className, ...props }: DialogDescriptionProps) {
  const { styles, dialog, setDescribed } = useInternalDialogContext('Dialog.Description');

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
