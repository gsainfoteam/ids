import { tv } from '../../../utils';

import type { Progress } from '.';
import type { IdsSize } from '../../../tokens/types';

export const progressStyle = tv({
  slots: {
    root: 'flex w-full flex-col gap-2',
    header: 'flex items-baseline gap-2',
    track: 'relative w-full overflow-hidden rounded-full bg-neutral-soft',
    indicator: 'h-full rounded-full bg-scheme-solid',
    label: 'min-w-0 truncate text-neutral-strong',
    value: 'ms-auto shrink-0 text-neutral tabular-nums',
  },
  variants: {
    size: {
      standard: { track: 'h-2', label: 'text-body-b3-medium', value: 'text-body-b3-regular' },
      tiny: { track: 'h-1', label: 'text-caption-c1-medium', value: 'text-caption-c1-regular' },
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
    } satisfies Record<Progress.ColorScheme, object>,
    indeterminate: {
      true: {
        indicator: [
          'w-1/4 animate-progress-slide rtl:[animation-direction:reverse]',
          'motion-reduce:w-full motion-reduce:animate-none motion-reduce:opacity-40',
        ],
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
  defaultVariants: {
    size: 'standard',
    colorScheme: 'primary',
    indeterminate: false,
  },
});
