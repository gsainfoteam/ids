import { tv } from '../../../utils';

import type { BubbleAlign, BubbleVariant } from '.';

export const bubbleStyle = tv({
  slots: {
    root: [
      'relative w-[var(--bubble-fit-width,fit-content)] max-w-[var(--bubble-max-width,80%)] min-w-0',
      'concentric-p-3 text-body-b2-regular text-balance [overflow-wrap:anywhere]',
    ],
    reactions: 'flex items-center gap-1',
  },
  variants: {
    variant: {
      soft: { root: 'bg-neutral-subtle text-neutral-bold' },
      solid: { root: 'bg-primary text-on-primary' },
      outline: {
        root: 'bg-neutral-subtlest text-neutral-bold inset-ring-1 inset-ring-neutral',
      },
    } satisfies Record<BubbleVariant, object>,
    align: {
      start: { root: 'rounded-es-indicator' },
      end: { root: 'rounded-ee-indicator' },
    } satisfies Record<BubbleAlign, object>,
    overlap: {
      true: {
        root: 'mb-4',
        reactions: [
          'absolute top-full w-max min-w-[calc(100%-var(--spacing)*6)] -translate-y-1.5 flex-nowrap',
          'pointer-events-none *:pointer-events-auto *:ring-2 *:ring-(--ids-color-bg-neutral-subtlest)',
        ],
      },
      false: { reactions: 'flex-wrap not-first:mt-2' },
    },
  },
  compoundVariants: [
    { overlap: true, align: 'start', class: { reactions: 'start-3 justify-end' } },
    { overlap: true, align: 'end', class: { reactions: 'end-3 justify-start' } },
  ],
  defaultVariants: { variant: 'soft', align: 'start', overlap: false },
});
