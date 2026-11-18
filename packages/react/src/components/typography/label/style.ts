import { tv } from '../../../utils';

import type { IdsSize } from '../../../tokens/types';

export const labelStyle = tv({
  slots: {
    root: [
      'inline-flex items-center gap-2 text-neutral-bold select-none',
      'data-disabled:cursor-not-allowed data-disabled:opacity-50',
      'data-invalid:text-danger',
    ],
    marker: '-ms-1 text-danger',
  },
  variants: {
    size: {
      standard: { root: 'text-body-b3-medium' },
      tiny: { root: 'text-caption-c1-medium' },
    } satisfies Record<IdsSize, object>,
  },
  defaultVariants: { size: 'standard' },
});
