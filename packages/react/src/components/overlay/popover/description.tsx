import { useLayoutEffect, type ComponentProps } from 'react';

import { usePopoverContext } from './context';
import { Slot } from '../../utility/slot';

export type PopoverDescriptionProps = ComponentProps<'p'> & { asChild?: boolean };

export function PopoverDescription({ asChild, className, ...props }: PopoverDescriptionProps) {
  const { styles, popover, setDescribed } = usePopoverContext('Popover.Description');

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
