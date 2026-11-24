'use client';

import { type ComponentProps } from 'react';

import { Slot } from '../../../utility/slot';
import { useInternalDrawerContext } from '../context';

export type DrawerHeaderProps = ComponentProps<'div'> & { asChild?: boolean };

export function DrawerHeader({ asChild, className, ...props }: DrawerHeaderProps) {
  const { styles } = useInternalDrawerContext('Drawer.Header');
  const Root = asChild ? Slot : 'div';
  return <Root {...props} data-drawer-header="" className={styles.header({ className })} />;
}

DrawerHeader.displayName = 'Drawer.Header';
