import { tv } from '../../../utils';

import type { CheckboxGroupOrientation } from '.';

export const checkboxGroupStyle = tv({
  base: 'relative flex outline-none',
  variants: {
    orientation: {
      vertical: 'flex-col gap-3',
      horizontal: 'flex-row flex-wrap gap-x-6 gap-y-3',
    } satisfies Record<CheckboxGroupOrientation, string>,
  },
  defaultVariants: { orientation: 'vertical' },
});
