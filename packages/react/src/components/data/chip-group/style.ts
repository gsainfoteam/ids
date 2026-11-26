import { tv } from '../../../utils';

import type { IdsSize } from '../../../tokens/types';

export const chipGroupStyle = tv({
  base: 'flex min-w-0 flex-wrap items-center',
  variants: {
    size: {
      standard: 'gap-2',
      tiny: 'gap-1.5',
    } satisfies Record<IdsSize, string>,
  },
  defaultVariants: { size: 'standard' },
});
