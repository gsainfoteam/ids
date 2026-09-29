import { type ComponentProps, type MouseEvent } from 'react';

import { XMarkIcon } from '@heroicons/react/16/solid';

import { useDrawerContext } from './context';
import { messages } from '../../../internal/messages';
import { part } from '../../../utils';
import { Button } from '../../action/button';
import { IconButton } from '../../action/icon-button';

export type DrawerCloseProps = Omit<ComponentProps<'button'>, 'type'> & { asChild?: boolean };

export function DrawerClose({ asChild, children, onClick, ...props }: DrawerCloseProps) {
  const { drawer } = useDrawerContext('Drawer.Close');

  const close = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) drawer.setOpen(false);
  };

  if (asChild)
    return part('button', true, children, { ...props, onClick: close, 'data-drawer-close': '' });
  if (children == null)
    return (
      <IconButton
        aria-label={messages.drawer.close}
        {...props}
        variant="ghost"
        size="tiny"
        icon={<XMarkIcon />}
        onClick={close}
        data-drawer-close=""
      />
    );
  return (
    <Button variant="outline" {...props} onClick={close} data-drawer-close="">
      {children}
    </Button>
  );
}

DrawerClose.displayName = 'Drawer.Close';
