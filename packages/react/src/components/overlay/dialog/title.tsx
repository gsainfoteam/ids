import { useLayoutEffect, type ComponentProps } from 'react';

import { useDialogContext } from './context';
import { Slot } from '../../utility/slot';

export type DialogTitleProps = ComponentProps<'h2'> & { asChild?: boolean };

export function DialogTitle({ asChild, className, ...props }: DialogTitleProps) {
  const { styles, dialog, setTitled } = useDialogContext('Dialog.Title');

  useLayoutEffect(() => {
    setTitled(true);
    return () => setTitled(false);
  }, [setTitled]);

  const Root = asChild ? Slot : 'h2';

  return (
    <Root
      id={dialog.ids.title}
      {...props}
      data-dialog-title=""
      className={styles.title({ className })}
    />
  );
}

DialogTitle.displayName = 'Dialog.Title';
