import { tv } from '../../../utils';

import type { BadgeColorScheme, BadgePlacement, BadgeVariant } from '.';
import type { IdsSize } from '../../../tokens/types';

export const badgeStyle = tv({
  slots: {
    root: 'relative inline-flex shrink-0 align-middle [--badge-inset-x:0px] [--badge-inset-y:0px]',
    indicator: [
      'inline-flex shrink-0 items-center justify-center rounded-full tabular-nums',
      'whitespace-nowrap select-none',
      'transition-[scale,opacity] duration-(--ids-motion-fast) motion-reduce:transition-none',
      'starting:scale-0 starting:opacity-0',
      'pointer-events-none absolute z-10 ring-2 ring-(--ids-bg-current)',
    ],
  },
  variants: {
    colorScheme: {
      neutral: { indicator: 'scheme-neutral' },
      primary: { indicator: 'scheme-primary' },
      secondary: { indicator: 'scheme-secondary' },
      tertiary: { indicator: 'scheme-tertiary' },
      success: { indicator: 'scheme-success' },
      warning: { indicator: 'scheme-warning' },
      danger: { indicator: 'scheme-danger' },
      info: { indicator: 'scheme-info' },
    } satisfies Record<BadgeColorScheme, object>,
    variant: {
      solid: { indicator: 'bg-scheme-solid text-on-scheme-solid' },
      soft: { indicator: 'bg-scheme-soft text-on-scheme-soft' },
      outline: { indicator: 'bg-base text-scheme inset-ring-1 inset-ring-neutral' },
    } satisfies Record<BadgeVariant, object>,
    size: { standard: {}, tiny: {} } satisfies Record<IdsSize, object>,
    dot: { true: {}, false: {} },
    placement: {
      'top-end': {
        indicator:
          'top-(--badge-inset-y) end-(--badge-inset-x) -translate-y-1/2 ltr:translate-x-1/2 rtl:-translate-x-1/2',
      },
      'top-start': {
        indicator:
          'start-(--badge-inset-x) top-(--badge-inset-y) -translate-y-1/2 ltr:-translate-x-1/2 rtl:translate-x-1/2',
      },
      'bottom-end': {
        indicator:
          'end-(--badge-inset-x) bottom-(--badge-inset-y) translate-y-1/2 ltr:translate-x-1/2 rtl:-translate-x-1/2',
      },
      'bottom-start': {
        indicator:
          'start-(--badge-inset-x) bottom-(--badge-inset-y) translate-y-1/2 ltr:-translate-x-1/2 rtl:translate-x-1/2',
      },
    } satisfies Record<BadgePlacement, object>,
  },
  compoundVariants: [
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
    colorScheme: 'danger',
    size: 'standard',
    dot: false,
    placement: 'top-end',
  },
});
