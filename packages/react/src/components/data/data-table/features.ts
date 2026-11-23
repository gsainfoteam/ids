import {
  columnResizingFeature,
  columnSizingFeature,
  createColumnHelper,
  createPaginatedRowModel,
  createSortedRowModel,
  metaHelper,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  type CellData,
  type ColumnDef,
  type ColumnHelper,
  type RowData,
  type RowSelectionState,
  type Updater,
} from '@tanstack/table-core';

import type { TableAlign } from '../table/context';

export type DataTableColumnMeta = {
  align?: TableAlign;
  label?: string;
};

export type DataTableSelectionChange = (updater: Updater<RowSelectionState>) => void;

export type DataTableMeta = {
  selectable: boolean;
  paginated: boolean;
  resizable: boolean;
  getRowLabel: ((row: never) => string) | undefined;
  setRtl: (rtl: boolean) => void;
  showSelection: (selection: RowSelectionState) => void;
  ownSelection: (owner: DataTableSelectionChange) => () => void;
};

export const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    basic: sortFn_basic,
    datetime: sortFn_datetime,
    text: sortFn_text,
  },
  rowSelectionFeature,
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
  columnSizingFeature,
  columnResizingFeature,
  columnMeta: metaHelper<DataTableColumnMeta>(),
  tableMeta: metaHelper<DataTableMeta>(),
});

export type DataTableFeatures = typeof dataTableFeatures;

export type DataTableColumnDef<
  TData extends RowData,
  TValue extends CellData = CellData,
> = ColumnDef<DataTableFeatures, TData, TValue>;

export function createDataTableColumnHelper<TData extends RowData>(): ColumnHelper<
  DataTableFeatures,
  TData
> {
  return createColumnHelper<DataTableFeatures, TData>();
}
