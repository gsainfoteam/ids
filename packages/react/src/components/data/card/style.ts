import { tv } from '../../../utils';

import type { CardVariant } from '.';
import type { IdsSize } from '../../../tokens/types';

export const cardStyle = tv({
  slots: {
    root: [
      'relative isolate flex flex-col text-(--ids-color-on-surface)',
      '[--card-pad:var(--ids-concentric-pad)]',
    ],
    header: [
      'grid auto-rows-min items-start gap-1 border-(--ids-color-border)',
      'has-[[data-card-action]]:grid-cols-[minmax(0,1fr)_auto]',
      '[.border-b]:-mx-(--card-pad) [.border-b]:px-(--card-pad) [.border-b]:pb-(--card-gap)',
    ],
    title: '[overflow-wrap:anywhere]',
    description: 'text-(--ids-color-on-muted)',
    action: 'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
    content: 'flex-1 border-(--ids-color-border)',
    footer: [
      'flex items-center gap-2 border-(--ids-color-border)',
      '[.border-t]:-mx-(--card-pad) [.border-t]:px-(--card-pad) [.border-t]:pt-(--card-gap)',
    ],
    media: [
      'relative -mx-[calc(var(--card-pad)_-_var(--card-ring))] overflow-hidden',
      'first:-mt-[calc(var(--card-pad)_-_var(--card-ring))] first:rounded-t-[inherit]',
      'last:-mb-[calc(var(--card-pad)_-_var(--card-ring))] last:rounded-b-[inherit]',
      '[&>img]:size-full [&>img]:object-cover [&>video]:size-full [&>video]:object-cover',
    ],
  },
  variants: {
    variant: {
      outline: {
        root: 'bg-(--ids-color-surface) shadow-xs inset-ring-1 inset-ring-(--ids-color-border) [--card-ring:1px]',
      },
      soft: { root: 'bg-(--ids-color-muted) [--card-ring:0px]' },
      ghost: { root: 'bg-transparent [--card-ring:0px]' },
    } satisfies Record<CardVariant, object>,
    size: {
      standard: {
        root: 'gap-4 concentric-p-4 text-body-b3-regular [--card-gap:--spacing(4)]',
        title: 'text-subtitle-s2-semibold',
        description: 'text-body-b3-regular',
      },
      tiny: {
        root: 'gap-3 concentric-p-3 text-caption-c1-regular [--card-gap:--spacing(3)]',
        title: 'text-body-b3-semibold',
        description: 'text-caption-c1-regular',
      },
    } satisfies Record<IdsSize, object>,
    interactive: {
      true: {
        root: [
          'cursor-pointer select-none focus-ring',
          'transition-[box-shadow] duration-(--ids-motion-fast) motion-reduce:transition-none',
          'before:pointer-events-none before:absolute before:inset-0 before:-z-10',
          'before:rounded-[inherit] before:bg-(--ids-color-on-surface) before:opacity-0',
          'before:transition-opacity before:duration-(--ids-motion-fast) motion-reduce:before:transition-none',
          'data-hovered:before:opacity-4 data-active:before:opacity-8',
          'data-disabled:cursor-not-allowed data-disabled:opacity-50',
        ],
      },
      false: {},
    },
  },
  defaultVariants: { variant: 'outline', size: 'standard', interactive: false },
});
