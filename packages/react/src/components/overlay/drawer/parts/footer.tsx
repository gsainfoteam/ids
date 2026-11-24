'use client';

import { type ComponentProps } from 'react';

import { Slot } from '../../../utility/slot';
import { useInternalDrawerContext } from '../context';

export type DrawerFooterProps = ComponentProps<'div'> & { asChild?: boolean };

export function DrawerFooter({ asChild, className, ...props }: DrawerFooterProps) {
  const { styles } = useInternalDrawerContext('Drawer.Footer');
  const Root = asChild ? Slot : 'div';
  return <Root {...props} data-drawer-footer="" className={styles.footer({ className })} />;
}

DrawerFooter.displayName = 'Drawer.Footer';
