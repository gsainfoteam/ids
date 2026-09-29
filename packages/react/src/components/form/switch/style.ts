import { tv } from '../../../utils';

import type { IdsSize } from '../../../tokens/types';

export const switchStyle = tv({
  slots: {
    root: [
      'relative inline-flex shrink-0 items-center rounded-full p-0.5 align-middle',
      'bg-(--ids-color-border) shadow-xs inset-ring-1 inset-ring-transparent focus-ring',
      'transition-[color,background-color,box-shadow] duration-(--ids-motion-fast) motion-reduce:transition-none',
      '[--switch-accent:var(--ids-color-primary)] [--switch-on-accent:var(--ids-color-on-primary)]',
      'data-invalid:[--switch-accent:var(--ids-color-danger)] data-invalid:[--switch-on-accent:var(--ids-color-on-danger)]',
      'data-[state=checked]:bg-(--switch-accent)',
      'data-disabled:opacity-50',
    ],
    input:
      'absolute inset-0 m-0 size-full cursor-pointer appearance-none rounded-full opacity-0 disabled:cursor-not-allowed',
    thumb: [
      'pointer-events-none flex shrink-0 items-center justify-center rounded-full shadow-sm',
      'bg-(--ids-color-surface) text-(--ids-color-on-muted) dark:bg-(--ids-color-on-surface)',
      'data-[state=checked]:bg-(--switch-on-accent) data-[state=checked]:text-(--switch-accent)',
      'transition-[translate,background-color] duration-(--ids-motion-fast) motion-reduce:transition-none',
      '[&>svg]:size-3/4',
    ],
  },
  variants: {
    size: {
      standard: {
        root: 'h-5 w-9',
        thumb: 'size-4 data-[state=checked]:translate-x-4 rtl:data-[state=checked]:-translate-x-4',
      },
      tiny: {
        root: 'h-4 w-7',
        thumb: 'size-3 data-[state=checked]:translate-x-3 rtl:data-[state=checked]:-translate-x-3',
      },
    } satisfies Record<IdsSize, object>,
  },
  defaultVariants: { size: 'standard' },
});
