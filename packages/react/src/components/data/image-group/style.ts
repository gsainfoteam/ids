import { tv } from '../../../utils';

import type { ImageGroupLayout } from '.';

export const imageGroupStyle = tv({
  slots: {
    root: 'min-w-0',
    item: 'flex min-w-0',
  },
  variants: {
    layout: {
      row: { root: 'flex flex-row gap-2', item: 'flex-1' },
      column: { root: 'flex flex-col gap-2' },
      grid: { root: 'grid grid-cols-[repeat(var(--image-columns),minmax(0,1fr))] gap-2' },
    } satisfies Record<ImageGroupLayout, object>,
  },
  defaultVariants: { layout: 'row' },
});
