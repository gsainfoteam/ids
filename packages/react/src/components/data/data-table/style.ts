import { resizeHandle } from '../../../internal/resize-handle';
import { tv } from '../../../utils';

import type { IdsSize } from '../../../tokens/types';
import type { TableAlign, TableVariant } from '../table/context';

export const dataTableStyle = tv({
  slots: {
    root: 'flex w-full min-w-0 flex-col',
    frame: 'relative',
    table: '',
    header: '',
    head: 'group/head relative',
    cell: '',
    sortButton: [
      'group/sort -mx-2 w-[calc(100%+1rem)] justify-between gap-2 px-2 text-inherit',
      'data-hovered:text-on-surface data-active:text-on-surface',
      'has-[>:is(svg,[aria-hidden=true],[role=status]):first-child]:ps-2',
      'has-[>:is(svg,[aria-hidden=true],[role=status]):last-child]:pe-2',
    ],
    label: 'inline-flex min-w-0 items-center gap-1.5 [&_svg]:size-4 [&_svg]:shrink-0',
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
      'hover:before:bg-neutral-hover focus-visible:before:bg-neutral-active',
      'data-resizing:before:bg-neutral-active',
    ],
    selectCell: 'w-0 whitespace-nowrap',
    message: 'h-24 text-center text-neutral',
    overlay: 'absolute inset-0 z-20 flex items-center justify-center bg-surface/60',
    spinner: 'size-6 text-neutral',
    footer: 'flex flex-wrap items-center justify-between gap-3',
    summary: 'text-neutral',
    pagination: 'ms-auto',
    pageStep: '',
    page: 'min-w-16 px-1 text-center whitespace-nowrap tabular-nums',
  },
  variants: {
    variant: {
      outline: {
        root: 'concentric-p-1 bg-neutral-soft',
        table: '[--table-radius:var(--radius-standard)] bg-surface shadow-xs',
        header:
          '[--data-table-header:color-mix(in_oklab,var(--ids-color-bg-neutral-soft),var(--ids-color-surface))] bg-(--data-table-header)',
        head: 'not-last:border-e not-last:border-neutral',
        cell: 'not-last:border-e not-last:border-neutral',
        sortButton:
          '[--control-hover:var(--ids-color-bg-neutral-soft-hover)] [--control-press:var(--ids-color-bg-neutral-soft-active)]',
        overlay: 'rounded-standard',
        footer: 'gap-2 ps-3 pe-1 pt-1',
        pageStep:
          '[--control-hover:var(--ids-color-bg-neutral-soft-hover)] [--control-press:var(--ids-color-bg-neutral-soft-active)]',
      },
      ghost: {
        root: 'gap-3',
        overlay: 'rounded-container',
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
    align: {
      start: {},
      center: { sortButton: 'justify-center' },
      end: { sortButton: 'flex-row-reverse' },
    } satisfies Record<TableAlign, object>,
    loading: {
      true: { frame: 'pointer-events-none' },
      false: {},
    },
  },
  defaultVariants: { variant: 'outline', size: 'standard', align: 'start', loading: false },
});
