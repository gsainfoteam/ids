import { tv } from '../../../utils';

import type { IdsSize } from '../../../tokens/types';

export const switchStyle = tv({
  slots: {
    root: [
      'relative inline-flex shrink-0 items-center rounded-full p-0.5 align-middle',
      'bg-(--ids-color-border-neutral) shadow-xs inset-ring-1 inset-ring-transparent focus-ring',
      'transition-[color,background-color,box-shadow] duration-(--ids-motion-fast) motion-reduce:transition-none',
      'scheme-primary data-invalid:scheme-danger',
      'data-[state=checked]:bg-scheme-solid',
      'data-disabled:opacity-50',
    ],
    input:
      'absolute inset-0 m-0 size-full cursor-pointer appearance-none rounded-full opacity-0 disabled:cursor-not-allowed',
    thumb: [
      'pointer-events-none flex shrink-0 items-center justify-center rounded-full shadow-sm',
      'bg-switch-thumb text-neutral',
      'data-[state=checked]:bg-(--ids-color-text-on-scheme-solid) data-[state=checked]:text-(--ids-color-bg-scheme-solid)',
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
