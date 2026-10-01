'use client';

import { type ComponentProps } from 'react';

import { useDrawerContext } from './context';
import { Slot } from '../../utility/slot';

export type DrawerFooterProps = ComponentProps<'div'> & { asChild?: boolean };

export function DrawerFooter({ asChild, className, ...props }: DrawerFooterProps) {
  const { styles } = useDrawerContext('Drawer.Footer');
  const Root = asChild ? Slot : 'div';
  return <Root {...props} data-drawer-footer="" className={styles.footer({ className })} />;
}

DrawerFooter.displayName = 'Drawer.Footer';
