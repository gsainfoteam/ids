'use client';

import type { ComponentProps } from 'react';

import { Slot } from '../../../utility/slot';
import { useInternalDrawerContext } from '../context';
import { useInternalDrawerPartPresence } from '../hooks/use-drawer-part-presence';

export type DrawerTitleProps = ComponentProps<'h2'> & { asChild?: boolean };

export function DrawerTitle({ asChild, className, ...props }: DrawerTitleProps) {
  const { styles, drawer, setTitled } = useInternalDrawerContext('Drawer.Title');

  useInternalDrawerPartPresence(setTitled);

  const Root = asChild ? Slot : 'h2';

  return (
    <Root
      id={drawer.ids.title}
      {...props}
      data-drawer-title=""
      className={styles.title({ className })}
    />
  );
}

DrawerTitle.displayName = 'Drawer.Title';
