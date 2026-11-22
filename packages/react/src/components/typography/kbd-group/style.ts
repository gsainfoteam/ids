import { tv } from '../../../utils';

import type { IdsSize } from '../../../tokens/types';

export const kbdGroupStyle = tv({
  base: 'inline-flex items-center gap-1',
  variants: {
    size: {
      standard: 'align-[calc(0.5cap-var(--spacing)*2.5)]',
      tiny: 'align-[calc(0.5cap-var(--spacing)*2)]',
    } satisfies Record<IdsSize, string>,
  },
  defaultVariants: { size: 'standard' },
});
