import { tv } from '../../../utils';

import type { EmptyAlign, EmptyMediaVariant, EmptyVariant } from '.';
import type { IdsSize } from '../../../tokens/types';

export const emptyStyle = tv({
  slots: {
    root: 'flex w-full min-w-0 flex-col text-(--ids-color-on-surface)',
    media: [
      'flex shrink-0 items-center justify-center overflow-hidden text-(--ids-color-on-muted)',
      '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&>img]:max-w-full',
    ],
    title: 'text-balance [overflow-wrap:anywhere]',
    description: [
      'max-w-sm text-pretty text-(--ids-color-on-muted)',
      '[&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-(--ids-color-on-surface)',
    ],
    actions: 'flex flex-wrap items-center gap-2',
  },
  variants: {
    variant: {
      ghost: {},
      soft: { root: 'bg-(--ids-color-muted)' },
      outline: { root: 'border border-dashed border-(--ids-color-border)' },
    } satisfies Record<EmptyVariant, object>,
    media: {
      soft: { media: 'rounded-standard bg-(--ids-color-muted) text-(--ids-color-on-surface)' },
      outline: {
        media:
          'rounded-standard inset-ring-1 inset-ring-(--ids-color-border) text-(--ids-color-on-surface)',
      },
      ghost: {},
    } satisfies Record<EmptyMediaVariant, object>,
    size: {
      standard: {
        root: 'concentric-p-8',
        media: 'mb-4',
        title: 'text-subtitle-s2-semibold',
        description: 'mt-1 text-body-b3-regular',
        actions: 'mt-5',
      },
      tiny: {
        root: 'concentric-p-4',
        media: 'mb-3',
        title: 'text-body-b3-semibold',
        description: 'mt-0.5 text-caption-c1-regular',
        actions: 'mt-3',
      },
    } satisfies Record<IdsSize, object>,
    align: {
      center: { root: 'items-center text-center', actions: 'justify-center' },
      start: { root: 'items-start text-start', actions: 'justify-start' },
    } satisfies Record<EmptyAlign, object>,
  },
  compoundVariants: [
    { media: ['soft', 'outline'], size: 'standard', class: { media: 'size-12 [&_svg]:size-6' } },
    { media: ['soft', 'outline'], size: 'tiny', class: { media: 'size-10 [&_svg]:size-5' } },
    {
      media: 'ghost',
      size: 'standard',
      class: { media: "[&_svg:not([class*='size-'])]:size-12" },
    },
    { media: 'ghost', size: 'tiny', class: { media: "[&_svg:not([class*='size-'])]:size-10" } },
    { media: 'soft', variant: 'soft', class: { media: 'bg-(--ids-color-surface)' } },
    { media: ['soft', 'outline'], class: { media: '[&>img]:size-full [&>img]:object-cover' } },
  ],
  defaultVariants: { variant: 'ghost', media: 'soft', size: 'standard', align: 'center' },
});
