import { type ComponentProps, type MouseEvent } from 'react';

import { XMarkIcon } from '@heroicons/react/16/solid';

import { useDialogContext } from './context';
import { messages } from '../../../internal/messages';
import { part } from '../../../utils';
import { Button } from '../../action/button';
import { IconButton } from '../../action/icon-button';

export type DialogCloseProps = Omit<ComponentProps<'button'>, 'type'> & { asChild?: boolean };

export function DialogClose({ asChild, children, onClick, ...props }: DialogCloseProps) {
  const { dialog } = useDialogContext('Dialog.Close');

  const close = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) dialog.setOpen(false);
  };

  if (asChild)
    return part('button', true, children, { ...props, onClick: close, 'data-dialog-close': '' });
  if (children == null)
    return (
      <IconButton
        aria-label={messages.dialog.close}
        {...props}
        variant="ghost"
        size="tiny"
        icon={<XMarkIcon />}
        onClick={close}
        data-dialog-close=""
      />
    );
  return (
    <Button variant="outline" {...props} onClick={close} data-dialog-close="">
      {children}
    </Button>
  );
}

DialogClose.displayName = 'Dialog.Close';
