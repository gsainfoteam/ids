import { tv } from '../../../utils';

import type { TableAlign, TableLayout, TableSection, TableVariant } from './context';
import type { IdsSize } from '../../../tokens/types';

export const tableStyle = tv({
  slots: {
    root: 'w-full max-w-full',
    viewport: 'isolate',
    table: 'w-full border-separate border-spacing-0 text-on-surface',
    caption: 'caption-bottom text-start text-neutral',
    header: '',
    body: '',
    footer: 'bg-neutral-soft',
    row: 'transition-colors duration-(--ids-motion-fast) motion-reduce:transition-none',
    head: 'border-b border-neutral align-middle whitespace-nowrap',
    cell: 'border-b border-neutral align-middle',
  },
  variants: {
    variant: {
      outline: {
        root: '[--table-radius:var(--radius-container)] rounded-(--table-radius) border border-neutral',
        viewport: 'rounded-[calc(var(--table-radius)-1px)]',
        header: 'bg-neutral-soft',
      },
      ghost: { header: 'bg-surface' },
    } satisfies Record<TableVariant, object>,
    size: {
      standard: {
        caption: 'px-4 py-3 text-body-b3-regular',
        head: 'h-10 px-4 text-body-b3-medium',
        cell: 'px-4 py-2.5 text-body-b3-regular',
      },
      tiny: {
        caption: 'px-3 py-2 text-caption-c1-regular',
        head: 'h-8 px-3 text-caption-c1-medium',
        cell: 'px-3 py-1.5 text-caption-c1-regular',
      },
    } satisfies Record<IdsSize, object>,
    layout: {
      auto: {},
      fixed: { table: 'table-fixed' },
    } satisfies Record<TableLayout, object>,
    striped: { true: {}, false: {} },
    stickyHeader: {
      true: { header: 'sticky top-0 z-10' },
      false: {},
    },
    section: {
      header: { head: 'text-neutral' },
      body: {
        row: [
          'data-selected:bg-primary-soft data-selected:text-on-primary-soft',
          'data-selected:hover:bg-primary-soft-hover',
          'last:*:border-b-0',
        ],
      },
      footer: { head: 'border-t border-b-0', cell: 'border-t border-b-0' },
    } satisfies Record<TableSection, object>,
    hoverable: {
      true: { row: 'not-data-selected:hover:bg-neutral-soft' },
      false: {},
    },
    clickable: {
      true: { row: 'cursor-pointer' },
      false: {},
    },
    align: {
      start: { head: 'text-start', cell: 'text-start' },
      center: { head: 'text-center', cell: 'text-center' },
      end: { head: 'text-end', cell: 'text-end' },
    } satisfies Record<TableAlign, object>,
  },
  compoundVariants: [
    { striped: true, section: 'body', class: { row: 'even:not-data-selected:bg-neutral-soft' } },
    {
      striped: true,
      section: 'body',
      hoverable: true,
      class: { row: 'even:not-data-selected:hover:bg-neutral-soft-hover' },
    },
  ],
  defaultVariants: {
    variant: 'outline',
    size: 'standard',
    layout: 'auto',
    striped: false,
    stickyHeader: false,
    section: 'body',
    hoverable: false,
    clickable: false,
    align: 'start',
  },
});
