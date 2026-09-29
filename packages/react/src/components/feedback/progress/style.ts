import { tv } from '../../../utils';

import type { Progress } from '.';
import type { IdsSize } from '../../../tokens/types';

export const progressStyle = tv({
  slots: {
    root: '',
    header: 'flex items-baseline gap-2',
    track: 'relative w-full overflow-hidden rounded-full bg-(--ids-color-muted)',
    indicator: 'h-full rounded-full bg-(--progress-fill)',
    circle: 'relative inline-flex shrink-0 items-center justify-center',
    svg: 'size-full',
    trackCircle: 'text-(--ids-color-muted)',
    indicatorCircle: [
      'origin-center -rotate-90 text-(--progress-fill)',
      'transition-[stroke-dashoffset] duration-(--ids-motion-normal) ease-out motion-reduce:transition-none',
    ],
    center: 'absolute inset-0 flex items-center justify-center [&_svg]:size-[40%]',
    label: 'min-w-0 truncate text-(--ids-color-on-surface)',
    value: 'shrink-0 text-(--ids-color-on-muted) tabular-nums',
  },
  variants: {
    shape: {
      linear: { root: 'flex w-full flex-col gap-2' },
      circular: { root: 'inline-flex items-center gap-2' },
    } satisfies Record<Progress.Shape, object>,
    size: {
      standard: { track: 'h-2', circle: 'size-10', label: 'text-body-b3-medium' },
      tiny: { track: 'h-1', circle: 'size-6', label: 'text-caption-c1-medium' },
    } satisfies Record<IdsSize, object>,
    colorScheme: {
      primary: { root: '[--progress-fill:var(--ids-color-primary)]' },
      neutral: { root: '[--progress-fill:var(--ids-color-on-surface)]' },
      info: { root: '[--progress-fill:var(--ids-color-info)]' },
      success: { root: '[--progress-fill:var(--ids-color-success)]' },
      warning: { root: '[--progress-fill:var(--ids-color-warning)]' },
      danger: { root: '[--progress-fill:var(--ids-color-danger)]' },
    } satisfies Record<Progress.ColorScheme, object>,
    indeterminate: {
      true: {
        indicator: [
          'w-1/4 animate-progress-slide rtl:[animation-direction:reverse]',
          'motion-reduce:w-full motion-reduce:animate-none motion-reduce:opacity-40',
        ],
        svg: 'animate-spin motion-reduce:animate-none',
      },
      false: {
        indicator: [
          'w-full translate-x-[calc((var(--progress-ratio)-1)*100%)]',
          'rtl:translate-x-[calc((1-var(--progress-ratio))*100%)]',
          'transition-[translate] duration-(--ids-motion-normal) ease-out motion-reduce:transition-none',
        ],
      },
    },
  },
  compoundVariants: [
    { shape: 'linear', size: 'standard', class: { value: 'ms-auto text-body-b3-regular' } },
    { shape: 'linear', size: 'tiny', class: { value: 'ms-auto text-caption-c1-regular' } },
    { shape: 'circular', class: { value: 'text-caption-c2-medium' } },
  ],
  defaultVariants: {
    shape: 'linear',
    size: 'standard',
    colorScheme: 'primary',
    indeterminate: false,
  },
});
