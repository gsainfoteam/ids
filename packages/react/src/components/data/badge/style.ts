import { tv } from '../../../utils';

import type { BadgeColorScheme, BadgePlacement, BadgeVariant } from '.';
import type { IdsSize } from '../../../tokens/types';

export const badgeStyle = tv({
  slots: {
    root: 'relative inline-flex shrink-0 align-middle [--badge-inset:0px]',
    indicator: [
      'inline-flex shrink-0 items-center justify-center rounded-full tabular-nums',
      'whitespace-nowrap select-none',
      'transition-[scale,opacity] duration-(--ids-motion-fast) motion-reduce:transition-none',
      'data-invisible:scale-0 data-invisible:opacity-0',
    ],
  },
  variants: {
    colorScheme: {
      neutral: {
        indicator: [
          '[--badge-accent:var(--ids-color-text-neutral-bold)] [--badge-fill:var(--ids-color-bg-neutral-bold)] [--badge-on-fill:var(--ids-color-text-on-neutral-bold)] [--badge-text:var(--ids-color-text-neutral-bold)]',
          '[--badge-tint:var(--ids-color-bg-neutral-subtle)] [--badge-on-tint:var(--ids-color-text-on-neutral-subtle)]',
        ],
      },
      primary: {
        indicator: [
          '[--badge-accent:var(--ids-color-border-primary)] [--badge-fill:var(--ids-color-bg-primary)] [--badge-on-fill:var(--ids-color-text-on-primary)] [--badge-text:var(--ids-color-text-primary)]',
          '[--badge-tint:var(--ids-color-bg-primary-subtle)] [--badge-on-tint:var(--ids-color-text-on-primary-subtle)]',
        ],
      },
      secondary: {
        indicator: [
          '[--badge-accent:var(--ids-color-border-secondary)] [--badge-fill:var(--ids-color-bg-secondary)] [--badge-on-fill:var(--ids-color-text-on-secondary)] [--badge-text:var(--ids-color-text-secondary)]',
          '[--badge-tint:var(--ids-color-bg-secondary-subtle)] [--badge-on-tint:var(--ids-color-text-on-secondary-subtle)]',
        ],
      },
      tertiary: {
        indicator: [
          '[--badge-accent:var(--ids-color-border-tertiary)] [--badge-fill:var(--ids-color-bg-tertiary)] [--badge-on-fill:var(--ids-color-text-on-tertiary)] [--badge-text:var(--ids-color-text-tertiary)]',
          '[--badge-tint:var(--ids-color-bg-tertiary-subtle)] [--badge-on-tint:var(--ids-color-text-on-tertiary-subtle)]',
        ],
      },
      success: {
        indicator: [
          '[--badge-accent:var(--ids-color-border-success)] [--badge-fill:var(--ids-color-bg-success)] [--badge-on-fill:var(--ids-color-text-on-success)] [--badge-text:var(--ids-color-text-success)]',
          '[--badge-tint:var(--ids-color-bg-success-subtle)] [--badge-on-tint:var(--ids-color-text-on-success-subtle)]',
        ],
      },
      warning: {
        indicator: [
          '[--badge-accent:var(--ids-color-border-warning)] [--badge-fill:var(--ids-color-bg-warning)] [--badge-on-fill:var(--ids-color-text-on-warning)] [--badge-text:var(--ids-color-text-warning)]',
          '[--badge-tint:var(--ids-color-bg-warning-subtle)] [--badge-on-tint:var(--ids-color-text-on-warning-subtle)]',
        ],
      },
      danger: {
        indicator: [
          '[--badge-accent:var(--ids-color-border-danger)] [--badge-fill:var(--ids-color-bg-danger)] [--badge-on-fill:var(--ids-color-text-on-danger)] [--badge-text:var(--ids-color-text-danger)]',
          '[--badge-tint:var(--ids-color-bg-danger-subtle)] [--badge-on-tint:var(--ids-color-text-on-danger-subtle)]',
        ],
      },
      info: {
        indicator: [
          '[--badge-accent:var(--ids-color-border-info)] [--badge-fill:var(--ids-color-bg-info)] [--badge-on-fill:var(--ids-color-text-on-info)] [--badge-text:var(--ids-color-text-info)]',
          '[--badge-tint:var(--ids-color-bg-info-subtle)] [--badge-on-tint:var(--ids-color-text-on-info-subtle)]',
        ],
      },
    } satisfies Record<BadgeColorScheme, object>,
    variant: {
      solid: { indicator: 'bg-(--badge-fill) text-(--badge-on-fill)' },
      soft: { indicator: 'bg-(--badge-tint) text-(--badge-on-tint)' },
      outline: {
        indicator: 'bg-neutral-subtlest text-(--badge-text) inset-ring-1 inset-ring-(--badge-accent)/45',
      },
    } satisfies Record<BadgeVariant, object>,
    size: { standard: {}, tiny: {} } satisfies Record<IdsSize, object>,
    dot: { true: {}, false: {} },
    shape: {
      auto: { root: 'has-[>[data-avatar][data-shape=circle]]:[--badge-inset:14.6%]' },
      rectangular: {},
      circular: { root: '[--badge-inset:14.6%]' },
    },
    placement: {
      'top-end': {
        indicator:
          'top-(--badge-inset) end-(--badge-inset) -translate-y-1/2 ltr:translate-x-1/2 rtl:-translate-x-1/2',
      },
      'top-start': {
        indicator:
          'start-(--badge-inset) top-(--badge-inset) -translate-y-1/2 ltr:-translate-x-1/2 rtl:translate-x-1/2',
      },
      'bottom-end': {
        indicator:
          'end-(--badge-inset) bottom-(--badge-inset) translate-y-1/2 ltr:translate-x-1/2 rtl:-translate-x-1/2',
      },
      'bottom-start': {
        indicator:
          'start-(--badge-inset) bottom-(--badge-inset) translate-y-1/2 ltr:-translate-x-1/2 rtl:translate-x-1/2',
      },
      none: {},
    } satisfies Record<BadgePlacement | 'none', object>,
  },
  compoundVariants: [
    {
      placement: ['top-end', 'top-start', 'bottom-end', 'bottom-start'],
      class: {
        indicator: ['pointer-events-none absolute z-10', 'ring-2 ring-(--ids-color-bg-neutral-subtlest)'],
      },
    },
    {
      dot: false,
      size: 'standard',
      class: {
        indicator:
          'h-5 min-w-5 px-1.5 text-caption-c1-medium leading-none gap-0.5 [&_svg]:size-3 [&_svg]:shrink-0',
      },
    },
    {
      dot: false,
      size: 'tiny',
      class: {
        indicator:
          'h-4 min-w-4 px-1 text-caption-c2-medium leading-none gap-0.5 [&_svg]:size-2.5 [&_svg]:shrink-0',
      },
    },
    { dot: true, size: 'standard', class: { indicator: 'size-2.5' } },
    { dot: true, size: 'tiny', class: { indicator: 'size-2' } },
  ],
  defaultVariants: {
    variant: 'solid',
    colorScheme: 'neutral',
    size: 'standard',
    dot: false,
    shape: 'auto',
    placement: 'top-end',
  },
});
