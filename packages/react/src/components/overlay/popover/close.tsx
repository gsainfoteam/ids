import { type ComponentProps, type MouseEvent } from 'react';

import { XMarkIcon } from '@heroicons/react/16/solid';

import { usePopoverContext } from './context';
import { messages } from '../../../internal/messages';
import { part } from '../../../utils';
import { Button } from '../../action/button';
import { IconButton } from '../../action/icon-button';

export type PopoverCloseProps = Omit<ComponentProps<'button'>, 'type'> & { asChild?: boolean };

export function PopoverClose({ asChild, children, onClick, ...props }: PopoverCloseProps) {
  const { popover } = usePopoverContext('Popover.Close');

  const close = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) popover.setOpen(false);
  };

  if (asChild)
    return part('button', true, children, { ...props, onClick: close, 'data-popover-close': '' });
  if (children == null)
    return (
      <IconButton
        aria-label={messages.popover.close}
        {...props}
        variant="ghost"
        size="tiny"
        icon={<XMarkIcon />}
        onClick={close}
        data-popover-close=""
      />
    );
  return (
    <Button variant="outline" {...props} onClick={close} data-popover-close="">
      {children}
    </Button>
  );
}

PopoverClose.displayName = 'Popover.Close';
