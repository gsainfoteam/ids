'use client';

import type { ComponentProps } from 'react';

import { Slot } from '../../../utility/slot';
import { useInternalDrawerContext } from '../context';
import { useInternalDrawerPartPresence } from '../hooks/use-drawer-part-presence';

export type DrawerDescriptionProps = ComponentProps<'p'> & { asChild?: boolean };

export function DrawerDescription({ asChild, className, ...props }: DrawerDescriptionProps) {
  const { styles, drawer, setDescribed } = useInternalDrawerContext('Drawer.Description');

  useInternalDrawerPartPresence(setDescribed);

  const Root = asChild ? Slot : 'p';

  return (
    <Root
      id={drawer.ids.description}
      {...props}
      data-drawer-description=""
      className={styles.description({ className })}
    />
  );
}

DrawerDescription.displayName = 'Drawer.Description';
