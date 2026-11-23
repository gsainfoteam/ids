'use client';

import { useMemo, useState } from 'react';

import {
  useTable,
  type ColumnSizingState,
  type PaginationState,
  type ReactTable,
  type RowSelectionState,
  type SortingState,
} from '@tanstack/react-table';

import { dataTableFeatures, type DataTableColumnDef, type DataTableFeatures } from './features';
import { selectionColumn } from './selection';
import { useControllableState } from '../../../hooks/use-controllable-state';

import type { CellData, Row, RowData } from '@tanstack/table-core';

type ValueOptions<T> = {
  value?: T;
  defaultValue?: T;
  onValueChange?: (value: T) => void;
};

export type DataTableSortingOptions = ValueOptions<SortingState> & {
  multiple?: boolean;
  removable?: boolean;
  manual?: boolean;
};

export type DataTableSelectionOptions<TData extends RowData> = ValueOptions<RowSelectionState> & {
  multiple?: boolean;
  enabled?: (row: Row<DataTableFeatures, TData>) => boolean;
};

export type DataTablePaginationOptions = ValueOptions<PaginationState> & {
  manual?: boolean;
  rowCount?: number;
};

export type DataTableColumnSizingOptions = ValueOptions<ColumnSizingState>;

export type UseDataTableOptions<TData extends RowData> = {
  columns: ReadonlyArray<DataTableColumnDef<TData, CellData>>;
  data: ReadonlyArray<TData>;
  getRowId?: (row: TData, index: number) => string;
  getRowLabel?: (row: TData) => string;
  sorting?: DataTableSortingOptions;
  selection?: DataTableSelectionOptions<TData>;
  pagination?: DataTablePaginationOptions;
  columnSizing?: DataTableColumnSizingOptions;
};

export type DataTableInstance<TData extends RowData> = ReactTable<DataTableFeatures, TData>;

const NO_SORTING: SortingState = [];
const NO_SELECTION: RowSelectionState = {};
const FIRST_PAGE_OF_TEN: PaginationState = { pageIndex: 0, pageSize: 10 };
const NO_COLUMN_SIZES: ColumnSizingState = {};
const COLUMN_WIDTH_LIMITS = { minSize: 48, maxSize: 960 };

export function useDataTable<TData extends RowData>({
  columns,
  data,
  getRowId,
  getRowLabel,
  sorting: sortingOptions,
  selection: selectionOptions,
  pagination: paginationOptions,
  columnSizing: columnSizingOptions,
}: UseDataTableOptions<TData>): DataTableInstance<TData> {
  const [sorting, setSorting] = useControllableState({
    value: sortingOptions?.value,
    defaultValue: sortingOptions?.defaultValue ?? NO_SORTING,
    onValueChange: sortingOptions?.onValueChange,
  });
  const [rowSelection, setRowSelection] = useControllableState({
    value: selectionOptions?.value,
    defaultValue: selectionOptions?.defaultValue ?? NO_SELECTION,
    onValueChange: selectionOptions?.onValueChange,
  });
  const [pagination, setPagination] = useControllableState({
    value: paginationOptions?.value,
    defaultValue: paginationOptions?.defaultValue ?? FIRST_PAGE_OF_TEN,
    onValueChange: paginationOptions?.onValueChange,
  });
  const [columnSizing, setColumnSizing] = useControllableState({
    value: columnSizingOptions?.value,
    defaultValue: columnSizingOptions?.defaultValue ?? NO_COLUMN_SIZES,
    onValueChange: columnSizingOptions?.onValueChange,
  });
  const [rtl, setRtl] = useState(false);

  const sortable = sortingOptions !== undefined;
  const selectable = selectionOptions !== undefined;
  const paginated = paginationOptions !== undefined;
  const resizable = columnSizingOptions !== undefined;

  const allColumns = useMemo(
    () =>
      selectable ? [selectionColumn as DataTableColumnDef<TData, CellData>, ...columns] : columns,
    [selectable, columns],
  );

  return useTable({
    features: dataTableFeatures,
    columns: allColumns,
    data,
    getRowId,
    defaultColumn: COLUMN_WIDTH_LIMITS,
    state: { sorting, rowSelection, pagination, columnSizing },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onColumnSizingChange: setColumnSizing,
    enableSorting: sortable,
    enableMultiSort: sortingOptions?.multiple,
    enableSortingRemoval: sortingOptions?.removable,
    manualSorting: sortingOptions?.manual,
    enableRowSelection: selectable && (selectionOptions.enabled ?? true),
    enableMultiRowSelection: selectionOptions?.multiple,
    manualPagination: !paginated || paginationOptions.manual,
    rowCount: paginationOptions?.rowCount,
    enableColumnResizing: resizable,
    columnResizeMode: 'onChange',
    columnResizeDirection: rtl ? 'rtl' : 'ltr',
    meta: { selectable, paginated, resizable, getRowLabel, setRtl },
  });
}
