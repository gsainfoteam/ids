import { cn, tv } from '../../../utils';

import type { IdsSize } from '../../../tokens/types';

const fadeOffWhileItsRingShows = cn('focus-visible:mask-none');

export const timePickerStyle = tv({
  slots: {
    root: 'flex min-w-0 flex-wrap gap-1 text-neutral-bold',
    header: 'flex w-full basis-full gap-1 text-neutral select-none',
    headerLabel: 'min-w-12 flex-1 text-center',
    separator: 'self-center text-neutral select-none',
    columnArea: 'min-w-12 flex-1 rounded-standard',
    column: [
      'group/column relative h-(--time-picker-height) rounded-standard',
      'before:block before:h-[calc(50%-var(--time-option)/2)] after:block after:h-[calc(50%-var(--time-option)/2)]',
      'focus-ring aria-disabled:cursor-not-allowed aria-disabled:overflow-y-hidden',
      fadeOffWhileItsRingShows,
      'data-[variant=wheel]:snap-y data-[variant=wheel]:snap-mandatory data-[variant=wheel]:[overflow-anchor:none]',
    ],
    option: [
      'flex h-(--time-option) shrink-0 snap-center items-center justify-center rounded-standard px-2 tabular-nums select-none',
      'cursor-pointer transition-[color,background-color,box-shadow,--ids-state-opacity] duration-(--ids-motion-fast) motion-reduce:transition-none',
      'state-layer not-data-disabled:hover:state-hover not-data-disabled:active:state-press',
      'group-focus-visible/column:data-active:state-hover',
      'data-selected:bg-primary data-selected:font-medium data-selected:text-on-primary',
      'group-focus-visible/column:data-selected:data-active:inset-ring-2 group-focus-visible/column:data-selected:data-active:inset-ring-(--ids-color-text-on-primary)/60',
      'data-disabled:cursor-not-allowed data-disabled:opacity-50',
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
