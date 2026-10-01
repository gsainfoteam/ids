import { type CSSProperties, type ReactNode } from 'react';

import {
  createDataTableColumnHelper,
  type DataTableColumnDef,
  type DataTableColumnMeta,
  type DataTableFeatures,
} from './features';
import { DataTableRoot } from './root';
import { dataTableStyle } from './style';

import type { IdsSize } from '../../../tokens/types';
import type { TableVariant } from '../table/context';
import type {
  CellData,
  ColumnHelper,
  PaginationState,
  Row,
  RowData,
  RowSelectionState,
  SortingState,
} from '@tanstack/table-core';

export function DataTable<TData extends RowData>(props: DataTable.Props<TData>) {
  return <DataTableRoot {...props} />;
}

export namespace DataTable {
  export type Features = DataTableFeatures;
  export type ColumnDef<
    TData extends RowData,
    TValue extends CellData = CellData,
  > = DataTableColumnDef<TData, TValue>;
  export type ColumnMeta = DataTableColumnMeta;
  export type ColumnHelperOf<TData extends RowData> = ColumnHelper<DataTableFeatures, TData>;
  export type RowOf<TData extends RowData> = Row<DataTableFeatures, TData>;
  export type Sorting = SortingState;
  export type RowSelection = RowSelectionState;
  export type Pagination = PaginationState;

  export type Props<TData extends RowData> = {
    columns: ReadonlyArray<DataTableColumnDef<TData, CellData>>;
    data: ReadonlyArray<TData>;
    getRowId?: (row: TData, index: number) => string;
    getRowLabel?: (row: TData) => string;

    variant?: TableVariant;
    size?: IdsSize;
    striped?: boolean;
    stickyHeader?: boolean;
    highlightOnHover?: boolean;
    caption?: ReactNode;
    id?: string;
    'aria-label'?: string;
    'aria-labelledby'?: string;
    'aria-describedby'?: string;

    enableSorting?: boolean;
    enableMultiSort?: boolean;
    enableSortingRemoval?: boolean;
    manualSorting?: boolean;
    sorting?: SortingState;
    defaultSorting?: SortingState;
    onSortingChange?: (sorting: SortingState) => void;

    enableRowSelection?: boolean | ((row: Row<DataTableFeatures, TData>) => boolean);
    enableMultiRowSelection?: boolean;
    rowSelection?: RowSelectionState;
    defaultRowSelection?: RowSelectionState;
    onRowSelectionChange?: (rowSelection: RowSelectionState) => void;

    enablePagination?: boolean;
    manualPagination?: boolean;
    rowCount?: number;
    pagination?: PaginationState;
    defaultPagination?: PaginationState;
    onPaginationChange?: (pagination: PaginationState) => void;

    enableColumnResizing?: boolean;

    loading?: boolean;
    empty?: ReactNode;

    className?: string;
    style?: CSSProperties;
  };

  export const createColumnHelper = createDataTableColumnHelper;

  export const Style = dataTableStyle;
}

export type DataTableProps<TData extends RowData> = DataTable.Props<TData>;
export type { DataTableColumnDef, DataTableColumnMeta, DataTableFeatures } from './features';
