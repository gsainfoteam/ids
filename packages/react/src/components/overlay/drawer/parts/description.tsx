'use client';

import { useLayoutEffect, type ComponentProps } from 'react';

import { Slot } from '../../../utility/slot';
import { useInternalDrawerContext } from '../context';

export type DrawerDescriptionProps = ComponentProps<'p'> & { asChild?: boolean };

export function DrawerDescription({ asChild, className, ...props }: DrawerDescriptionProps) {
  const { styles, drawer, setDescribed } = useInternalDrawerContext('Drawer.Description');

  useLayoutEffect(() => {
    setDescribed(true);
    return () => setDescribed(false);
  }, [setDescribed]);

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
