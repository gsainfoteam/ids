import { primaryFill } from '../../../internal/brand-fill';
import { tv } from '../../../utils';

import type { IdsSize } from '../../../tokens/types';

export const timePickerStyle = tv({
  slots: {
    root: 'flex min-w-0 flex-wrap gap-1 text-(--ids-color-on-surface)',
    header: 'flex w-full basis-full gap-1 text-(--ids-color-on-muted) select-none',
    headerLabel: 'min-w-12 flex-1 text-center',
    separator: 'self-center text-(--ids-color-on-muted) select-none',
    columnArea: 'min-w-12 flex-1 rounded-standard',
    column: [
      'group/column relative h-(--time-picker-height) rounded-standard',
      'before:block before:h-[calc(50%-var(--time-option)/2)] after:block after:h-[calc(50%-var(--time-option)/2)]',
      'focus-ring aria-disabled:cursor-not-allowed aria-disabled:overflow-y-hidden',
      'data-[variant=wheel]:snap-y data-[variant=wheel]:snap-mandatory data-[variant=wheel]:[overflow-anchor:none]',
    ],
    option: [
      'flex h-(--time-option) shrink-0 snap-center items-center justify-center rounded-standard px-2 tabular-nums select-none',
      'cursor-pointer transition-[color,background-color,box-shadow] duration-(--ids-motion-fast) motion-reduce:transition-none',
      'hover:bg-(--ids-color-muted) active:bg-(--ids-color-muted-hover)',
      'group-focus-visible/column:data-active:not-data-selected:bg-(--ids-color-muted)',
      primaryFill,
      'data-selected:bg-(--control-fill) data-selected:font-medium data-selected:text-(--control-on-fill)',
      'data-selected:hover:bg-(--control-fill-hover)',
      'group-focus-visible/column:data-selected:data-active:inset-ring-2 group-focus-visible/column:data-selected:data-active:inset-ring-(--ids-color-on-primary)/60',
      'data-disabled:cursor-not-allowed data-disabled:opacity-50 data-disabled:hover:bg-transparent data-disabled:active:bg-transparent',
    ],
  },
  variants: {
    size: {
      standard: {
        root: [
          '[--time-option:var(--ids-size-control-standard)] text-body-b3-regular',
          '[--time-picker-height:calc(var(--time-option)*5)]',
        ],
        header: 'text-caption-c1-regular',
        option: 'text-body-b3-regular',
      },
      tiny: {
        root: [
          '[--time-option:var(--ids-size-control-tiny)] text-caption-c1-regular',
          '[--time-picker-height:calc(var(--time-option)*5)]',
        ],
        header: 'text-caption-c2-regular',
        option: 'text-caption-c1-regular',
      },
    } satisfies Record<IdsSize, object>,
  },
  defaultVariants: { size: 'standard' },
});
