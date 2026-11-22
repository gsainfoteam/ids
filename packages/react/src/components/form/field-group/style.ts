import { tv } from '../../../utils';

import type { FieldOrientation } from '../field/context';

export const fieldGroupStyle = tv({
  base: 'min-w-0 gap-x-3 gap-y-5',
  variants: {
    orientation: {
      vertical: 'flex flex-col',
      horizontal:
        'grid grid-cols-[auto_minmax(0,1fr)] *:col-span-full [&>[data-field][data-orientation=horizontal]]:grid-cols-subgrid',
    } satisfies Record<FieldOrientation, string>,
  },
  defaultVariants: { orientation: 'vertical' },
});
