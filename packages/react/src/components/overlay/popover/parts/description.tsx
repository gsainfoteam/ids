'use client';

import type { ComponentProps } from 'react';

import { Slot } from '../../../utility/slot';
import { useInternalPopoverContext } from '../context';
import { useInternalPopoverPartPresence } from '../hooks/use-popover-part-presence';

export type PopoverDescriptionProps = ComponentProps<'p'> & { asChild?: boolean };

export function PopoverDescription({ asChild, className, ...props }: PopoverDescriptionProps) {
  const { styles, popover, setDescribed } = useInternalPopoverContext('Popover.Description');

  useInternalPopoverPartPresence(setDescribed);

  const Root = asChild ? Slot : 'p';

  return (
    <Root
      id={popover.ids.description}
      {...props}
      data-popover-description=""
      className={styles.description({ className })}
    />
  );
}

PopoverDescription.displayName = 'Popover.Description';
