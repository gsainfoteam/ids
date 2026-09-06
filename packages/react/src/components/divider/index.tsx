import type { ComponentProps } from 'react';

import { tv } from '../../utils';

export function Divider({
  orientation = 'horizontal',
  decorative = false,
  className,
  ...rest
}: Divider.Props) {
  return (
    <div
      {...rest}
      className={Divider.Style({ orientation, className })}
      role={decorative ? undefined : 'separator'}
      aria-orientation={decorative ? undefined : orientation}
      aria-hidden={decorative ? true : undefined}
    />
  );
}

export namespace Divider {
  export const Style = tv({
    base: 'shrink-0 bg-(--ids-color-outline)',
    variants: {
      orientation: {
        horizontal: 'h-px w-full',
        vertical: 'w-px self-stretch',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
    },
  });

  export type Props = Omit<
    ComponentProps<'div'>,
    'children' | 'role' | 'aria-orientation' | 'aria-hidden' | 'tabIndex'
  > & {
    orientation?: 'horizontal' | 'vertical';
    /** Hide a purely visual line from assistive technology. */
    decorative?: boolean;
  };
}
