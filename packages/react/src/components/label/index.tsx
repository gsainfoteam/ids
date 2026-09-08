import type { ComponentProps } from 'react';

import { tv } from '../../utils';

/** A native label: associate via htmlFor or wrap a single form control. */
export function Label({ className, ...rest }: Label.Props) {
  return <label {...rest} className={Label.Style({ className })} />;
}

export namespace Label {
  export const Style = tv({
    base: 'inline-block text-body-b2-medium text-(--ids-color-on-surface)',
  });

  export type Props = ComponentProps<'label'>;
}
