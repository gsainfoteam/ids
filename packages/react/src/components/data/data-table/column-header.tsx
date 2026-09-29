'use client';

import { ArrowDownIcon, ArrowUpIcon, ChevronUpDownIcon } from '@heroicons/react/16/solid';
import { FlexRender } from '@tanstack/react-table';
import { clamp } from 'es-toolkit';

import { useDataTableContext } from './context';
import { SELECTION_COLUMN_ID } from './selection';
import { keyHandler } from '../../../internal/keys';
import { useTranslate } from '../../../internal/translate';
import { TableHead } from '../table/head';

import type { DataTableFeatures } from './features';
import type { Header, RowData, SortDirection } from '@tanstack/table-core';

type ColumnHeaderProps<TData extends RowData> = {
  header: Header<DataTableFeatures, TData, unknown>;
};

const RESIZE_STEP = 16;
const RESIZE_STEP_LARGE = 64;

const ARIA_SORT: Record<SortDirection, 'ascending' | 'descending'> = {
  asc: 'ascending',
  desc: 'descending',
};

function columnName<TData extends RowData>(header: ColumnHeaderProps<TData>['header']) {
  const { columnDef, id } = header.column;
  if (columnDef.meta?.label) return columnDef.meta.label;
  return typeof columnDef.header === 'string' ? columnDef.header : id;
}

function SortIcon({ sorted, className }: { sorted: false | SortDirection; className?: string }) {
  if (sorted === 'asc') return <ArrowUpIcon className={className} />;
  if (sorted === 'desc') return <ArrowDownIcon className={className} />;
  return <ChevronUpDownIcon className={className} />;
}

function ResizeHandle<TData extends RowData>({ header }: ColumnHeaderProps<TData>) {
  const t = useTranslate();
  const { styles, rtl } = useDataTableContext();
  const { column } = header;

  const size = column.getSize();
  const min = column.columnDef.minSize ?? 0;
  const max = column.columnDef.maxSize ?? size;
  const onResizeStart = header.getResizeHandler();

  const resizeBy = (delta: number) => () => {
    header
      .getContext()
      .table.setColumnSizing((sizes) => ({ ...sizes, [column.id]: clamp(size + delta, min, max) }));
  };

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={t('dataTable.resize', { column: columnName(header) })}
      aria-valuenow={size}
      aria-valuemin={min}
      aria-valuemax={max}
      tabIndex={0}
      data-data-table-resizer=""
      data-resizing={column.getIsResizing() ? '' : undefined}
      className={styles.resizer()}
      onMouseDown={onResizeStart}
      onTouchStart={onResizeStart}
      onDoubleClick={() => column.resetSize()}
      onKeyDown={keyHandler(
        {
          ArrowLeft: resizeBy(-RESIZE_STEP),
          ArrowRight: resizeBy(RESIZE_STEP),
          'Shift+ArrowLeft': resizeBy(-RESIZE_STEP_LARGE),
          'Shift+ArrowRight': resizeBy(RESIZE_STEP_LARGE),
          Home: resizeBy(min - size),
          End: resizeBy(max - size),
          Enter: () => column.resetSize(),
        },
        { dir: rtl ? 'rtl' : 'ltr' },
      )}
    />
  );
}

export function DataTableColumnHeader<TData extends RowData>({ header }: ColumnHeaderProps<TData>) {
  const { styles } = useDataTableContext();
  const { column } = header;

  const sorted = column.getIsSorted();
  const sortable = !header.isPlaceholder && column.getCanSort();
  const resizable = !header.isPlaceholder && column.getCanResize();
  const content = header.isPlaceholder ? null : <FlexRender header={header} />;

  return (
    <TableHead
      colSpan={header.colSpan > 1 ? header.colSpan : undefined}
      align={column.columnDef.meta?.align}
      aria-sort={sorted ? ARIA_SORT[sorted] : undefined}
      data-sorted={sorted || undefined}
      className={styles.head({
        className: column.id === SELECTION_COLUMN_ID ? styles.selectCell() : undefined,
      })}
    >
      {sortable ? (
        <button
          type="button"
          data-data-table-sort=""
          className={styles.sortButton()}
          onClick={column.getToggleSortingHandler()}
        >
          {content}
          <SortIcon sorted={sorted} className={styles.sortIcon()} />
        </button>
      ) : (
        content
      )}
      {resizable && <ResizeHandle header={header} />}
    </TableHead>
  );
}
