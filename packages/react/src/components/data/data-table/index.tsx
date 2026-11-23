import { type CSSProperties, type ReactNode } from 'react';

import { DataTableCaption, type DataTableCaptionProps } from './caption';
import { DataTableContent, type DataTableContentProps } from './content';
import { DataTableEmpty, type DataTableEmptyProps } from './empty';
import {
  createDataTableColumnHelper,
  type DataTableColumnDef,
  type DataTableColumnMeta,
  type DataTableFeatures,
} from './features';
import { DataTablePagination, type DataTablePaginationProps } from './pagination';
import { DataTableRoot } from './root';
import { dataTableStyle, type DataTableVariant } from './style';
import { DataTableToolbar, type DataTableToolbarProps } from './toolbar';

import type {
  DataTableColumnSizingOptions,
  DataTableInstance,
  DataTablePaginationOptions,
  DataTableSelectionOptions,
  DataTableSortingOptions,
  UseDataTableOptions,
} from './use-data-table';
import type { IdsSize } from '../../../tokens/types';
import type {
  CellData,
  ColumnHelper,
  ColumnSizingState as TanStackColumnSizingState,
  PaginationState as TanStackPaginationState,
  Row,
  RowData,
  RowSelectionState as TanStackRowSelectionState,
  SortingState as TanStackSortingState,
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
  export type Instance<TData extends RowData> = DataTableInstance<TData>;
  export type Options<TData extends RowData> = UseDataTableOptions<TData>;
  export type SortingOptions = DataTableSortingOptions;
  export type SelectionOptions<TData extends RowData> = DataTableSelectionOptions<TData>;
  export type PaginationOptions = DataTablePaginationOptions;
  export type ColumnSizingOptions = DataTableColumnSizingOptions;
  export type SortingState = TanStackSortingState;
  export type RowSelectionState = TanStackRowSelectionState;
  export type PaginationState = TanStackPaginationState;
  export type ColumnSizingState = TanStackColumnSizingState;
  export type Variant = DataTableVariant;

  export type Props<TData extends RowData> = {
    table: DataTableInstance<TData>;
    variant?: DataTableVariant;
    size?: IdsSize;
    id?: string;
    'aria-label'?: string;
    'aria-labelledby'?: string;
    'aria-describedby'?: string;
    'aria-busy'?: boolean | 'true' | 'false';
    value?: TanStackRowSelectionState;
    defaultValue?: TanStackRowSelectionState;
    onValueChange?: (value: TanStackRowSelectionState) => void;
    className?: string;
    style?: CSSProperties;
    children?: ReactNode;
  };

  export type ToolbarProps = DataTableToolbarProps;
  export type ContentProps = DataTableContentProps;
  export type PaginationProps = DataTablePaginationProps;
  export type CaptionProps = DataTableCaptionProps;
  export type EmptyProps = DataTableEmptyProps;

  export const Toolbar = DataTableToolbar;
  export namespace Toolbar {
    export type Props = DataTableToolbarProps;
  }
  export const Content = DataTableContent;
  export namespace Content {
    export type Props = DataTableContentProps;
  }
  export const Pagination = DataTablePagination;
  export namespace Pagination {
    export type Props = DataTablePaginationProps;
  }
  export const Caption = DataTableCaption;
  export namespace Caption {
    export type Props = DataTableCaptionProps;
  }
  export const Empty = DataTableEmpty;
  export namespace Empty {
    export type Props = DataTableEmptyProps;
  }

  export const createColumnHelper = createDataTableColumnHelper;

  export const Style = dataTableStyle;
}

export { useDataTable } from './use-data-table';
export type DataTableProps<TData extends RowData> = DataTable.Props<TData>;
export type {
  DataTableColumnSizingOptions,
  DataTableInstance,
  DataTablePaginationOptions,
  DataTableSelectionOptions,
  DataTableSortingOptions,
  UseDataTableOptions,
} from './use-data-table';
export type { DataTableVariant } from './style';
export type { DataTableColumnDef, DataTableColumnMeta, DataTableFeatures } from './features';
