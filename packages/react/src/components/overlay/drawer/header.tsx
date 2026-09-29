import { type ComponentProps } from 'react';

import { useDrawerContext } from './context';
import { Slot } from '../../utility/slot';

export type DrawerHeaderProps = ComponentProps<'div'> & { asChild?: boolean };

export function DrawerHeader({ asChild, className, ...props }: DrawerHeaderProps) {
  const { styles } = useDrawerContext('Drawer.Header');
  const Root = asChild ? Slot : 'div';
  return <Root {...props} data-drawer-header="" className={styles.header({ className })} />;
}

DrawerHeader.displayName = 'Drawer.Header';
