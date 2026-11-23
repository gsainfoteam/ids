import { tv } from '../../../utils';

import type { CircularProgress } from '.';
import type { IdsSize } from '../../../tokens/types';

export const circularProgressStyle = tv({
  slots: {
    root: 'inline-flex items-center gap-2',
    circle: 'relative inline-flex shrink-0 items-center justify-center',
    svg: 'size-full',
    track: 'text-(--ids-color-bg-neutral-soft)',
    indicator: [
      'origin-center -rotate-90 text-(--ids-color-bg-scheme-solid)',
      'transition-[stroke-dashoffset] duration-(--ids-motion-normal) ease-out motion-reduce:transition-none',
    ],
    center: 'absolute inset-0 flex items-center justify-center [&_svg]:size-[40%]',
    label: 'min-w-0 truncate text-neutral-strong',
    value: 'shrink-0 text-caption-c2-medium text-neutral tabular-nums',
  },
  variants: {
    size: {
      standard: { circle: 'size-10', label: 'text-body-b3-medium' },
      tiny: { circle: 'size-6', label: 'text-caption-c1-medium' },
    } satisfies Record<IdsSize, object>,
    colorScheme: {
      primary: { root: 'scheme-primary' },
      secondary: { root: 'scheme-secondary' },
      tertiary: { root: 'scheme-tertiary' },
      neutral: { root: 'scheme-neutral' },
      info: { root: 'scheme-info' },
      success: { root: 'scheme-success' },
      warning: { root: 'scheme-warning' },
      danger: { root: 'scheme-danger' },
    } satisfies Record<CircularProgress.ColorScheme, object>,
    indeterminate: {
      true: { svg: 'animate-spin motion-reduce:animate-none' },
      false: {},
    },
  },
  defaultVariants: {
    size: 'standard',
    colorScheme: 'primary',
    indeterminate: false,
  },
});
