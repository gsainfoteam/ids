import { resizeHandle } from '../../../internal/resize-handle';
import { tv } from '../../../utils';

import type { IdsSize } from '../../../tokens/types';
import type { TableVariant } from '../table/context';

export const dataTableStyle = tv({
  slots: {
    root: 'flex w-full min-w-0 flex-col gap-3',
    frame: 'relative',
    head: 'group/head relative',
    sortButton: [
      'group/sort -mx-2 max-w-full gap-1 px-2 text-inherit',
      'data-hovered:text-(--ids-color-on-surface) data-active:text-(--ids-color-on-surface)',
      'has-[>:is(svg,[aria-hidden=true],[role=status]):first-child]:ps-2',
      'has-[>:is(svg,[aria-hidden=true],[role=status]):last-child]:pe-2',
    ],
    sortIcon: [
      'pointer-events-none size-4 shrink-0 text-(--ids-color-on-muted)',
      'opacity-60 group-hover/sort:opacity-100 group-data-sorted/head:opacity-100',
    ],
    resizer: [
      resizeHandle.base,
      resizeHandle.hitArea.vertical,
      resizeHandle.focus,
      'absolute inset-y-0 end-0 z-10 flex w-3 translate-x-1/2 cursor-col-resize justify-center rounded-full rtl:-translate-x-1/2',
      'before:h-full before:w-0.5 before:rounded-full before:bg-transparent',
      'before:transition-colors before:duration-(--ids-motion-fast) motion-reduce:before:transition-none',
      'hover:before:bg-(--ids-color-handle-hover) focus-visible:before:bg-(--ids-color-handle-active)',
      'data-resizing:before:bg-(--ids-color-handle-active)',
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
    pagination: 'ms-auto',
    page: 'min-w-16 px-1 text-center whitespace-nowrap tabular-nums',
  },
  variants: {
    variant: {
      outline: {
        sortButton:
          '[--control-hover:var(--ids-color-muted-hover)] [--control-press:var(--ids-color-muted-active)]',
      },
      ghost: {},
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
