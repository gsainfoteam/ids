import { tv } from '../../../utils';

import type { TableAlign, TableLayout, TableSection, TableVariant } from './context';
import type { IdsSize } from '../../../tokens/types';

export const tableStyle = tv({
  slots: {
    root: 'w-full max-w-full',
    viewport: 'isolate',
    table: 'w-full border-separate border-spacing-0 text-neutral-bold',
    caption: 'caption-bottom text-start text-neutral',
    header: '',
    body: '',
    footer: 'bg-neutral-subtle',
    row: 'transition-colors duration-(--ids-motion-fast) motion-reduce:transition-none',
    head: 'border-b border-neutral align-middle whitespace-nowrap',
    cell: 'border-b border-neutral align-middle',
  },
  variants: {
    variant: {
      outline: {
        root: 'rounded-container border border-neutral',
        header: 'bg-neutral-subtle',
      },
      ghost: { header: 'bg-(--ids-bg-current)' },
    } satisfies Record<TableVariant, object>,
    size: {
      standard: {
        caption: 'px-4 py-3 text-body-b3-regular',
        head: 'h-11 px-4 text-body-b3-medium',
        cell: 'px-4 py-3 text-body-b3-regular',
      },
      tiny: {
        caption: 'px-3 py-2 text-caption-c1-regular',
        head: 'h-9 px-3 text-caption-c1-medium',
        cell: 'px-3 py-2 text-caption-c1-regular',
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
          'state-layer data-selected:state-press',
          'last:*:border-b-0',
        ],
      },
      footer: { head: 'border-t border-b-0', cell: 'border-t border-b-0' },
    } satisfies Record<TableSection, object>,
    hoverable: {
      true: { row: 'not-data-selected:hover:state-hover' },
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
    { striped: true, section: 'body', class: { row: 'even:bg-neutral-subtle' } },
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
