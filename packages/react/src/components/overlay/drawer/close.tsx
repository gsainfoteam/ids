'use client';

import { type ComponentProps, type MouseEvent } from 'react';

import { XMarkIcon } from '@heroicons/react/16/solid';

import { useDrawerContext } from './context';
import { useTranslate } from '../../../internal/translate';
import { part } from '../../../utils';
import { Button } from '../../action/button';
import { IconButton } from '../../action/icon-button';

export type DrawerCloseProps = Omit<ComponentProps<'button'>, 'type'> & { asChild?: boolean };

export function DrawerClose({ asChild, children, onClick, ...props }: DrawerCloseProps) {
  const t = useTranslate();

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
        aria-label={t('drawer.close')}
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
