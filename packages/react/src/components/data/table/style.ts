import { tv } from '../../../utils';

import type { TableAlign, TableLayout, TableSection, TableVariant } from './context';
import type { IdsSize } from '../../../tokens/types';

export const tableStyle = tv({
  slots: {
    root: 'w-full max-w-full',
    viewport: 'isolate',
    table: 'w-full border-separate border-spacing-0 text-neutral-strong',
    caption: 'caption-bottom text-start text-neutral',
    header: 'sticky top-0 z-10',
    body: '',
    footer: 'bg-block',
    row: 'transition-colors duration-(--ids-motion-fast) motion-reduce:transition-none',
    head: 'border-b border-neutral align-middle whitespace-nowrap',
    cell: 'border-b border-neutral align-middle',
  },
  variants: {
    variant: {
      outline: {},
      striped: {},
      ghost: { header: 'bg-(--ids-bg-current)' },
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
    section: {
      header: { head: 'text-neutral' },
      body: {
        row: [
          'state-layer',
          'data-selected:scheme-primary data-selected:state-scheme',
          'data-selected:bg-scheme-soft data-selected:text-on-scheme-soft',
          'last:*:border-b-0',
        ],
      },
      footer: { head: 'border-t border-b-0', cell: 'border-t border-b-0' },
    } satisfies Record<TableSection, object>,
    clickable: {
      true: { row: 'cursor-pointer hover:state-hover' },
      false: {},
    },
    align: {
      start: { head: 'text-start', cell: 'text-start' },
      center: { head: 'text-center', cell: 'text-center' },
      end: { head: 'text-end', cell: 'text-end' },
    } satisfies Record<TableAlign, object>,
  },
  compoundVariants: [
    {
      variant: ['outline', 'striped'],
      class: {
        root: '[--table-radius:var(--radius-container)] rounded-(--table-radius) border border-neutral',
        viewport: 'rounded-[calc(var(--table-radius)-1px)]',
        header: 'bg-block',
      },
    },
    { variant: 'striped', section: 'body', class: { row: 'even:not-data-selected:bg-block' } },
  ],
  defaultVariants: {
    variant: 'outline',
    size: 'standard',
    layout: 'auto',
    section: 'body',
    clickable: false,
    align: 'start',
  },
});
