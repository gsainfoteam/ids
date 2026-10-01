'use client';

import { useDataTableContext } from './context';
import { useTranslate } from '../../../internal/translate';
import { Checkbox } from '../../form/checkbox';

import type { DataTableColumnDef, DataTableFeatures } from './features';
import type { CellContext, HeaderContext, RowData } from '@tanstack/table-core';

export const SELECTION_COLUMN_ID = 'ids-select';
const CHECKBOX_COLUMN_WIDTH = 48;

function SelectAllRows({ table }: HeaderContext<DataTableFeatures, RowData, unknown>) {
  const t = useTranslate();
  const { size } = useDataTableContext();

  const all = table.getIsAllRowsSelected();
  const some = table.getIsSomeRowsSelected();

  return (
    <Checkbox
      size={size}
      aria-label={t('dataTable.selectAll')}
      checked={all ? true : some ? 'indeterminate' : false}
      disabled={table.getRowCount() === 0}
      onChange={table.getToggleAllRowsSelectedHandler()}
    />
  );
}

function SelectRow({ row }: CellContext<DataTableFeatures, RowData, unknown>) {
  const t = useTranslate();
  const { size, getRowLabel } = useDataTableContext();

  const label = getRowLabel
    ? t('dataTable.selectRow', {
        label: (getRowLabel as (row: unknown) => string)(row.original),
      })
    : t('dataTable.selectRowNumber', { number: row.index + 1 });

  return (
    <Checkbox
      size={size}
      aria-label={label}
      checked={row.getIsSelected() ? true : row.getIsSomeSelected() ? 'indeterminate' : false}
      disabled={!row.getCanSelect()}
      onChange={row.getToggleSelectedHandler()}
    />
  );
}

export const selectionColumn: DataTableColumnDef<RowData> = {
  id: SELECTION_COLUMN_ID,
  header: SelectAllRows,
  cell: SelectRow,
  size: CHECKBOX_COLUMN_WIDTH,
  minSize: CHECKBOX_COLUMN_WIDTH,
  enableSorting: false,
  enableResizing: false,
};
