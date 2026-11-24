'use client';

import { useLayoutEffect, type ComponentProps } from 'react';

import { Slot } from '../../../utility/slot';
import { useInternalPopoverContext } from '../context';

export type PopoverDescriptionProps = ComponentProps<'p'> & { asChild?: boolean };

export function PopoverDescription({ asChild, className, ...props }: PopoverDescriptionProps) {
  const { styles, popover, setDescribed } = useInternalPopoverContext('Popover.Description');

  useLayoutEffect(() => {
    setDescribed(true);
    return () => setDescribed(false);
  }, [setDescribed]);

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
