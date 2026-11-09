import { tv } from '../../../utils';

import type { BubbleAlign, BubbleVariant } from '.';

export const bubbleStyle = tv({
  slots: {
    root: [
      'relative w-[var(--bubble-fit-width,fit-content)] max-w-[var(--bubble-max-width,80%)] min-w-0',
      'concentric-p-3 text-body-b2-regular text-balance [overflow-wrap:anywhere]',
    ],
    reactions: 'flex flex-wrap items-center gap-1',
  },
  variants: {
    variant: {
      soft: { root: 'bg-(--ids-color-muted) text-(--ids-color-on-surface)' },
      solid: { root: 'bg-(--ids-color-primary) text-(--ids-color-on-primary)' },
      outline: {
        root: 'bg-(--ids-color-surface) text-(--ids-color-on-surface) inset-ring-1 inset-ring-(--ids-color-border)',
      },
    } satisfies Record<BubbleVariant, object>,
    align: {
      start: { root: 'rounded-es-indicator' },
      end: { root: 'rounded-ee-indicator' },
    } satisfies Record<BubbleAlign, object>,
    overlap: {
      true: {
        root: 'mb-3',
        reactions: ['absolute bottom-0 translate-y-1/2', '*:ring-2 *:ring-(--ids-color-surface)'],
      },
      false: { reactions: 'not-first:mt-2' },
    },
  },
  compoundVariants: [
    { overlap: true, align: 'start', class: { reactions: 'end-3' } },
    { overlap: true, align: 'end', class: { reactions: 'start-3' } },
  ],
  defaultVariants: { variant: 'soft', align: 'start', overlap: false },
});
