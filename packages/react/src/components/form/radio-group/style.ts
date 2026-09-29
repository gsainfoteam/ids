import { tv } from '../../../utils';

import type { RadioGroupOrientation } from '.';

export const radioGroupStyle = tv({
  base: 'flex outline-none',
  variants: {
    orientation: {
      vertical: 'flex-col gap-3',
      horizontal: 'flex-row flex-wrap gap-x-6 gap-y-3',
    } satisfies Record<RadioGroupOrientation, string>,
  },
  defaultVariants: { orientation: 'vertical' },
});
