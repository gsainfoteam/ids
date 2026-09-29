import { tv } from '../../../utils';

import type { IdsSize } from '../../../tokens/types';
import type { TableVariant } from '../table/context';

export const dataTableStyle = tv({
  slots: {
    root: 'flex w-full min-w-0 flex-col gap-3',
    frame: 'relative',
    head: 'group/head relative',
    sortButton: [
      'group/sort -mx-2 inline-flex max-w-full items-center gap-1 rounded-standard px-2 outline-none',
      'cursor-pointer text-inherit select-none focus-ring',
      'transition-colors duration-(--ids-motion-fast) motion-reduce:transition-none',
    ],
    sortIcon: [
      'pointer-events-none size-4 shrink-0 text-(--ids-color-on-muted)',
      'opacity-60 group-hover/sort:opacity-100 group-data-sorted/head:opacity-100',
    ],
    resizer: [
      'absolute inset-y-0 end-0 z-10 flex w-3 translate-x-1/2 cursor-col-resize touch-none justify-center outline-none select-none rtl:-translate-x-1/2',
      'after:h-full after:w-0.5 after:rounded-full after:bg-transparent',
      'after:transition-colors after:duration-(--ids-motion-fast) motion-reduce:after:transition-none',
      'hover:after:bg-(--ids-color-handle-hover) focus-visible:after:bg-(--ids-color-handle-active)',
      'data-resizing:after:bg-(--ids-color-handle-active)',
    ],
    selectCell: 'w-0 whitespace-nowrap',
    message: 'h-24 text-center text-(--ids-color-on-muted)',
    overlay: [
      'absolute inset-0 z-20 flex items-center justify-center rounded-container',
      'bg-(--ids-color-surface)/60',
    ],
    spinner: 'size-6 text-(--ids-color-on-muted)',
    footer: 'flex flex-wrap items-center justify-between gap-3',
    summary: 'text-(--ids-color-on-muted)',
    pagination: 'ms-auto flex items-center gap-1',
    page: 'min-w-16 px-1 text-center whitespace-nowrap tabular-nums',
    pageIcon: 'rtl:-scale-x-100',
  },
  variants: {
    variant: {
      outline: {
        sortButton: 'hover:bg-(--ids-color-muted-hover) active:bg-(--ids-color-muted-active)',
      },
      ghost: {
        sortButton: 'hover:bg-(--ids-color-muted) active:bg-(--ids-color-muted-hover)',
      },
    } satisfies Record<TableVariant, object>,
    size: {
      standard: {
        sortButton: 'h-8',
        summary: 'text-body-b3-regular',
        page: 'text-body-b3-regular',
      },
      tiny: {
        sortButton: 'h-7',
        summary: 'text-caption-c1-regular',
        page: 'text-caption-c1-regular',
      },
    } satisfies Record<IdsSize, object>,
    loading: {
      true: { frame: 'pointer-events-none' },
      false: {},
    },
  },
  defaultVariants: { variant: 'outline', size: 'standard', loading: false },
});
