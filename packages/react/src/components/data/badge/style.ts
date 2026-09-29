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
          '[--badge-accent:var(--ids-color-on-surface)] [--badge-fill:var(--ids-color-on-surface)] [--badge-on-fill:var(--ids-color-surface)] [--badge-text:var(--ids-color-on-surface)]',
          '[--badge-tint:color-mix(in_oklab,var(--ids-color-on-surface)_16%,var(--ids-color-surface))] [--badge-on-tint:var(--ids-color-on-surface)]',
        ],
      },
      primary: {
        indicator: [
          '[--badge-accent:var(--ids-color-primary)] [--badge-fill:var(--ids-color-primary)] [--badge-on-fill:var(--ids-color-on-primary)] [--badge-text:var(--ids-color-accent)]',
          '[--badge-tint:var(--ids-color-secondary)] [--badge-on-tint:var(--ids-color-on-secondary)]',
        ],
      },
      success: {
        indicator: [
          '[--badge-accent:var(--ids-color-success)] [--badge-fill:var(--ids-color-success)] [--badge-on-fill:var(--ids-color-on-success)] [--badge-text:var(--ids-color-success-strong)]',
          '[--badge-tint:color-mix(in_oklab,var(--ids-color-success)_16%,var(--ids-color-surface))] [--badge-on-tint:var(--ids-color-success-strong)]',
        ],
      },
      warning: {
        indicator: [
          '[--badge-accent:var(--ids-color-warning)] [--badge-fill:var(--ids-color-warning)] [--badge-on-fill:var(--ids-color-on-warning)] [--badge-text:var(--ids-color-warning-strong)]',
          '[--badge-tint:color-mix(in_oklab,var(--ids-color-warning)_16%,var(--ids-color-surface))] [--badge-on-tint:var(--ids-color-warning-strong)]',
        ],
      },
      danger: {
        indicator: [
          '[--badge-accent:var(--ids-color-danger)] [--badge-fill:var(--ids-color-danger)] [--badge-on-fill:var(--ids-color-on-danger)] [--badge-text:var(--ids-color-danger-strong)]',
          '[--badge-tint:color-mix(in_oklab,var(--ids-color-danger)_16%,var(--ids-color-surface))] [--badge-on-tint:var(--ids-color-danger-strong)]',
        ],
      },
      info: {
        indicator: [
          '[--badge-accent:var(--ids-color-info)] [--badge-fill:var(--ids-color-info)] [--badge-on-fill:var(--ids-color-on-info)] [--badge-text:var(--ids-color-info-strong)]',
          '[--badge-tint:color-mix(in_oklab,var(--ids-color-info)_16%,var(--ids-color-surface))] [--badge-on-tint:var(--ids-color-info-strong)]',
        ],
      },
    } satisfies Record<BadgeColorScheme, object>,
    variant: {
      solid: { indicator: 'bg-(--badge-fill) text-(--badge-on-fill)' },
      soft: { indicator: 'bg-(--badge-tint) text-(--badge-on-tint)' },
      outline: {
        indicator:
          'bg-(--ids-color-surface) text-(--badge-text) inset-ring-1 inset-ring-(--badge-accent)/45',
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
        indicator: ['pointer-events-none absolute z-10', 'ring-2 ring-(--ids-color-surface)'],
      },
    },
    {
      dot: false,
      size: 'standard',
      class: { indicator: 'h-5 min-w-5 px-1.5 text-caption-c1-medium leading-none' },
    },
    {
      dot: false,
      size: 'tiny',
      class: { indicator: 'h-4 min-w-4 px-1 text-caption-c2-medium leading-none' },
    },
    { dot: true, size: 'standard', class: { indicator: 'size-2.5' } },
    { dot: true, size: 'tiny', class: { indicator: 'size-2' } },
  ],
  defaultVariants: {
    variant: 'solid',
    colorScheme: 'danger',
    size: 'standard',
    dot: false,
    shape: 'auto',
    placement: 'top-end',
  },
});
