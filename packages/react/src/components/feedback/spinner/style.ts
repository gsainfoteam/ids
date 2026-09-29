import { tv } from '../../../utils';

import type { IdsSize } from '../../../tokens/types';

export const spinnerStyle = tv({
  slots: {
    root: ['inline-block shrink-0 align-[-0.125em]', 'animate-spin motion-reduce:animate-pulse'],
    track: 'opacity-20',
  },
  variants: {
    size: {
      standard: { root: 'size-(--ids-size-icon-standard)' },
      tiny: { root: 'size-(--ids-size-icon-tiny)' },
    } satisfies Record<IdsSize, object>,
  },
});
