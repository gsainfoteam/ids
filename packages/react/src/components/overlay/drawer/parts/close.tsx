'use client';

import { type ComponentProps, type MouseEvent } from 'react';

import { XMarkIcon } from '@heroicons/react/16/solid';

import { useInternalTranslate } from '../../../../internal/translate';
import { part } from '../../../../utils';
import { Button } from '../../../action/button';
import { IconButton } from '../../../action/icon-button';
import { useInternalDrawerContext } from '../context';

export type DrawerCloseProps = Omit<ComponentProps<'button'>, 'type'> & { asChild?: boolean };

export function DrawerClose({ asChild, children, className, onClick, ...props }: DrawerCloseProps) {
  const t = useInternalTranslate();

  const { drawer, styles } = useInternalDrawerContext('Drawer.Close');

  const close = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) drawer.setOpen(false);
  };

  if (asChild)
    return part('button', true, children, {
      ...props,
      className,
      onClick: close,
      'data-drawer-close': '',
    });
  if (children == null)
    return (
      <IconButton
        aria-label={t('common.close')}
        {...props}
        className={styles.close({ className })}
        variant="ghost"
        size="tiny"
        icon={<XMarkIcon />}
        onClick={close}
        data-drawer-close=""
      />
    );
  return (
    <Button variant="outline" {...props} className={className} onClick={close} data-drawer-close="">
      {children}
    </Button>
  );
}

DrawerClose.displayName = 'Drawer.Close';
