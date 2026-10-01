'use client';

import { useLayoutEffect, useMemo, useState, type RefObject } from 'react';

import {
  useTable,
  type ColumnSizingState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
} from '@tanstack/react-table';

import { dataTableFeatures, type DataTableColumnDef } from './features';
import { selectionColumn } from './selection';
import { useControllableState } from '../../../hooks/use-controllable-state';

import type { DataTable } from '.';
import type { CellData, RowData } from '@tanstack/table-core';

const NO_SORTING: SortingState = [];
const NO_SELECTION: RowSelectionState = {};
const FIRST_PAGE_OF_TEN: PaginationState = { pageIndex: 0, pageSize: 10 };
const COLUMN_WIDTH_LIMITS = { minSize: 48, maxSize: 960 };

function isRtl(element: HTMLElement) {
  const direction = element.ownerDocument.defaultView?.getComputedStyle(element).direction;
  if (direction) return direction === 'rtl';
  return element.closest('[dir]')?.getAttribute('dir') === 'rtl';
}

function useRtl(ref: RefObject<HTMLElement | null>) {
  const [rtl, setRtl] = useState(false);

  useLayoutEffect(() => {
    if (ref.current) setRtl(isRtl(ref.current));
  }, [ref]);

  return rtl;
}

export function useDataTable<TData extends RowData>(
  {
    columns,
    data,
    getRowId,
    enableSorting = true,
    enableMultiSort,
    enableSortingRemoval,
    manualSorting,
    sorting: sortingProp,
    defaultSorting = NO_SORTING,
    onSortingChange,
    enableRowSelection = false,
    enableMultiRowSelection,
    rowSelection: rowSelectionProp,
    defaultRowSelection = NO_SELECTION,
    onRowSelectionChange,
    enablePagination = false,
    manualPagination = false,
    rowCount,
    pagination: paginationProp,
    defaultPagination = FIRST_PAGE_OF_TEN,
    onPaginationChange,
    enableColumnResizing = false,
  }: DataTable.Props<TData>,
  rootRef: RefObject<HTMLElement | null>,
) {
  const [sorting, setSorting] = useControllableState({
    value: sortingProp,
    defaultValue: defaultSorting,
    onValueChange: onSortingChange,
  });
  const [rowSelection, setRowSelection] = useControllableState({
    value: rowSelectionProp,
    defaultValue: defaultRowSelection,
    onValueChange: onRowSelectionChange,
  });
  const [pagination, setPagination] = useControllableState({
    value: paginationProp,
    defaultValue: defaultPagination,
    onValueChange: onPaginationChange,
  });
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
  const rtl = useRtl(rootRef);

  const selectable = enableRowSelection !== false;
  const allColumns = useMemo(
    () =>
      selectable ? [selectionColumn as DataTableColumnDef<TData, CellData>, ...columns] : columns,
    [selectable, columns],
  );

  const table = useTable({
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
    enableSorting,
    enableMultiSort,
    enableSortingRemoval,
    manualSorting,
    enableRowSelection,
    enableMultiRowSelection,
    manualPagination: manualPagination || !enablePagination,
    rowCount,
    enableColumnResizing,
    columnResizeMode: 'onChange',
    columnResizeDirection: rtl ? 'rtl' : 'ltr',
  });

  return { table, rtl, selectable, paginated: enablePagination };
}
