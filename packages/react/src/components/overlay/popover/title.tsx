'use client';

import { useLayoutEffect, type ComponentProps } from 'react';

import { usePopoverContext } from './context';
import { Slot } from '../../utility/slot';

export type PopoverTitleProps = ComponentProps<'h2'> & { asChild?: boolean };

export function PopoverTitle({ asChild, className, ...props }: PopoverTitleProps) {
  const { styles, popover, setTitled } = usePopoverContext('Popover.Title');

  useLayoutEffect(() => {
    setTitled(true);
    return () => setTitled(false);
  }, [setTitled]);

  const Root = asChild ? Slot : 'h2';

  return (
    <Root
      id={popover.ids.title}
      {...props}
      data-popover-title=""
      className={styles.title({ className })}
    />
  );
}

PopoverTitle.displayName = 'Popover.Title';
