'use client';

import type { ComponentProps } from 'react';

import { Slot } from '../../../utility/slot';
import { useInternalPopoverContext } from '../context';
import { useInternalPopoverPartPresence } from '../hooks/use-popover-part-presence';

export type PopoverTitleProps = ComponentProps<'h2'> & { asChild?: boolean };

export function PopoverTitle({ asChild, className, ...props }: PopoverTitleProps) {
  const { styles, popover, setTitled } = useInternalPopoverContext('Popover.Title');

  useInternalPopoverPartPresence(setTitled);

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
