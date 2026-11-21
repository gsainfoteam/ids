import { tv } from '../../../utils';

import type { EmptyAlign, EmptyMediaVariant, EmptyVariant } from '.';
import type { IdsSize } from '../../../tokens/types';

export const emptyStyle = tv({
  slots: {
    root: 'flex w-full min-w-0 flex-col text-neutral-strong',
    media: [
      'flex shrink-0 items-center justify-center overflow-hidden text-neutral',
      '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&>img]:max-w-full',
    ],
    title: 'text-balance [overflow-wrap:anywhere]',
    description: [
      'max-w-sm text-pretty text-neutral',
      '[&_a:not([data-link])]:underline [&_a:not([data-link])]:underline-offset-4',
      '[&_a:not([data-link]):hover]:text-neutral-strong',
    ],
    actions: 'flex flex-wrap items-center gap-2',
  },
  variants: {
    variant: {
      ghost: {},
      soft: { root: 'bg-block' },
      outline: { root: 'border border-dashed border-neutral' },
    } satisfies Record<EmptyVariant, object>,
    media: {
      soft: { media: 'rounded-standard bg-neutral-soft text-neutral-strong' },
      outline: {
        media: 'rounded-standard inset-ring-1 inset-ring-neutral text-neutral-strong',
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
    { media: 'soft', variant: 'soft', class: { media: 'bg-base' } },
    { media: ['soft', 'outline'], class: { media: '[&>img]:size-full [&>img]:object-cover' } },
  ],
  defaultVariants: { variant: 'outline', media: 'soft', size: 'standard', align: 'center' },
});
