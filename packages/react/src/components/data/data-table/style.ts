import { resizeHandle } from '../../../internal/resize-handle';
import { tv } from '../../../utils';

import type { IdsSize } from '../../../tokens/types';
import type { TableAlign } from '../table/context';

export type DataTableVariant = 'outline' | 'striped' | 'ghost';

export const dataTableStyle = tv({
  slots: {
    root: 'flex w-full min-w-0 flex-col',
    frame: 'relative',
    table: '',
    header: 'sticky top-0 z-10',
    row: 'hover:state-hover',
    head: 'group/head relative',
    cell: '',
    sortButton: [
      'group/sort -mx-2 w-[calc(100%+1rem)] justify-between gap-2 px-2 text-inherit',
      'data-hovered:text-neutral-strong data-active:text-neutral-strong',
      'has-[>:is(svg,[aria-hidden=true],[role=status]):first-child]:ps-2',
      'has-[>:is(svg,[aria-hidden=true],[role=status]):last-child]:pe-2',
    ],
    label: 'flex min-w-0 items-center gap-1.5 [&>svg]:size-4 [&>svg]:shrink-0',
    sortIcon: [
      'pointer-events-none size-4 shrink-0 text-neutral opacity-0',
      'transition-opacity duration-(--ids-motion-fast) motion-reduce:transition-none',
      'group-data-hovered/sort:opacity-100 group-data-focus-visible/sort:opacity-100',
      'group-data-sorted/head:text-primary group-data-sorted/head:opacity-100',
    ],
    resizer: [
      resizeHandle.base,
      resizeHandle.hitArea.vertical,
      resizeHandle.focus,
      'absolute inset-y-0 end-0 z-10 flex w-3 translate-x-1/2 cursor-col-resize justify-center rounded-full rtl:-translate-x-1/2',
      'before:h-full before:w-0.5 before:rounded-full before:bg-transparent',
      'before:transition-colors before:duration-(--ids-motion-fast) motion-reduce:before:transition-none',
      'hover:before:bg-(--ids-color-text-neutral) focus-visible:before:bg-(--ids-color-text-neutral)',
      'data-resizing:before:bg-(--ids-color-text-neutral)',
    ],
    selectCell: 'w-0 whitespace-nowrap [&>[data-checkbox]]:flex',
    message: 'h-24 text-center text-neutral',
    overlay: 'absolute inset-0 z-20 flex items-center justify-center bg-base/60',
    spinner: 'size-6 text-neutral',
    bar: 'flex flex-wrap items-center gap-3',
    summary: 'text-neutral',
    pagination: 'ms-auto',
    page: 'min-w-16 px-1 text-center whitespace-nowrap tabular-nums',
  },
  variants: {
    variant: {
      outline: {},
      striped: {
        row: 'even:not-data-selected:bg-block',
      },
      ghost: {
        root: 'gap-3',
        overlay: 'rounded-container',
      },
    } satisfies Record<DataTableVariant, object>,
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
    align: {
      start: {},
      center: { sortButton: 'justify-center', label: 'justify-center' },
      end: { sortButton: 'flex-row-reverse', label: 'justify-end' },
    } satisfies Record<TableAlign, object>,
    busy: {
      true: { frame: 'pointer-events-none' },
      false: {},
    },
  },
  compoundVariants: [
    {
      variant: ['outline', 'striped'],
      class: {
        root: 'concentric-p-1 bg-neutral-soft',
        table: '[--table-radius:var(--radius-standard)] bg-surface shadow-xs',
        header: 'bg-block',
        head: 'not-last:border-e not-last:border-neutral',
        cell: 'not-last:border-e not-last:border-neutral',
        overlay: 'rounded-standard',
        bar: 'gap-2 ps-3 pe-1 not-first:pt-1 not-last:pb-1',
      },
    },
  ],
  defaultVariants: { variant: 'outline', size: 'standard', align: 'start', busy: false },
});
