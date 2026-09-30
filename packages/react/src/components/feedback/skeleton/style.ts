import { tv } from '../../../utils';

import type { Skeleton } from '.';

export const skeletonStyle = tv({
  slots: {
    root: '',
    paint: 'bg-(--ids-color-muted)',
    line: 'flex h-[1lh] items-center',
    bar: 'h-[1em] w-full rounded-indicator',
    content: 'contents',
  },
  variants: {
    shape: {
      rect: { root: 'block w-full overflow-hidden rounded-standard before:block before:h-4' },
      circle: { root: 'block size-10 shrink-0 rounded-full' },
      text: { root: 'block w-full' },
    } satisfies Record<Skeleton.Shape, object>,
    animation: {
      pulse: { paint: 'animate-skeleton-pulse motion-reduce:animate-none' },
      wave: {
        paint: [
          'bg-linear-to-r from-transparent via-(--ids-color-muted-hover) to-transparent',
          'bg-[length:50%_100%] bg-no-repeat',
          'animate-skeleton-wave rtl:[animation-direction:reverse]',
          'motion-reduce:animate-none motion-reduce:bg-none',
        ],
      },
      none: {},
    } satisfies Record<Skeleton.Animation, object>,
    wrapping: { div: {}, child: {} },
    loading: {
      true: { content: 'invisible' },
      false: {},
    },
    short: {
      true: { bar: 'w-3/5' },
      false: {},
    },
  },
  compoundVariants: [
    { wrapping: 'div', loading: true, class: { root: 'rounded-standard' } },
    {
      wrapping: 'child',
      loading: true,
      class: {
        root: [
          'bg-none text-transparent shadow-none inset-ring-0 border-transparent',
          '[&_*]:invisible [&::after]:invisible [&::before]:invisible',
        ],
      },
    },
  ],
  defaultVariants: { animation: 'pulse', loading: false, short: false },
});
