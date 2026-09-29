import { useLayoutEffect, type ComponentProps } from 'react';

import { useDrawerContext } from './context';
import { Slot } from '../../utility/slot';

export type DrawerTitleProps = ComponentProps<'h2'> & { asChild?: boolean };

export function DrawerTitle({ asChild, className, ...props }: DrawerTitleProps) {
  const { styles, drawer, setTitled } = useDrawerContext('Drawer.Title');

  useLayoutEffect(() => {
    setTitled(true);
    return () => setTitled(false);
  }, [setTitled]);

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
