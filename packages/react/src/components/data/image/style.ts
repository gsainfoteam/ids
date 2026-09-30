import { tv } from '../../../utils';

import type { ImageGroupLayout } from './group';

export const imageStyle = tv({
  slots: {
    root: 'relative block w-full overflow-hidden rounded-standard focus-ring',
    trigger: [
      'relative block size-full cursor-zoom-in outline-none',
      'after:pointer-events-none after:absolute after:inset-0 after:bg-black/0',
      'after:transition-colors after:duration-(--ids-motion-fast) motion-reduce:after:transition-none',
      'hover:after:bg-black/8 active:after:bg-black/16',
    ],
    image: 'relative block size-full object-cover',
    placeholder: 'absolute inset-0 flex items-center justify-center rounded-none',
    fallback: [
      'flex size-full items-center justify-center gap-2 p-2 text-center',
      'bg-(--ids-color-muted) text-body-b3-regular text-(--ids-color-on-muted)',
      '[&_svg]:size-[min(1.5rem,40%)] [&_svg]:shrink-0',
    ],
    group: 'min-w-0',
    groupItem: 'flex min-w-0',
  },
  variants: {
    layout: {
      row: { group: 'flex flex-row gap-2', groupItem: 'flex-1' },
      column: { group: 'flex flex-col gap-2' },
      grid: { group: 'grid grid-cols-[repeat(var(--image-columns),minmax(0,1fr))] gap-2' },
    } satisfies Record<ImageGroupLayout, object>,
    painted: {
      true: { placeholder: 'bg-(--ids-color-muted)' },
      false: {},
    },
  },
  defaultVariants: { layout: 'row', painted: false },
});
