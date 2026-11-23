import { tv } from '../../../utils';

import type { Skeleton } from '.';

export const skeletonStyle = tv({
  slots: {
    root: '',
    paint: 'bg-neutral-soft',
    content: 'contents',
  },
  variants: {
    animation: {
      pulse: { paint: 'animate-skeleton-pulse motion-reduce:animate-none' },
      wave: {
        paint: [
          'bg-linear-to-r from-transparent via-(--ids-color-bg-block) to-transparent',
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
  defaultVariants: { animation: 'pulse', loading: true },
});
