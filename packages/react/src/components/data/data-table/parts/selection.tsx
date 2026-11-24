'use client';

import { useInternalTranslate } from '../../../../internal/translate';
import { Checkbox } from '../../../form/checkbox';
import { useInternalDataTableContext } from '../context';

import type { DataTableColumnDef, DataTableFeatures } from '../lib/features';
import type { CellContext, HeaderContext, RowData } from '@tanstack/table-core';

export const SELECTION_COLUMN_ID = 'ids-select';
const CHECKBOX_COLUMN_WIDTH = 48;

function SelectAllRows({ table }: HeaderContext<DataTableFeatures, RowData, unknown>) {
  const t = useInternalTranslate();
  const { size, selection } = useInternalDataTableContext();

  const selectable = table.getCoreRowModel().flatRows.filter((row) => row.getCanSelect());
  const chosen = selectable.filter((row) => selection[row.id]).length;
  const all = selectable.length > 0 && chosen === selectable.length;
  const some = chosen > 0;

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

function SelectRow({ row, table }: CellContext<DataTableFeatures, RowData, unknown>) {
  const t = useInternalTranslate();
  const { size, selection } = useInternalDataTableContext();
  const getRowLabel = table.options.meta?.getRowLabel;

  const label = getRowLabel
    ? t('dataTable.selectRow', {
        label: (getRowLabel as (row: unknown) => string)(row.original),
      })
    : t('dataTable.selectRowNumber', { number: row.index + 1 });

  return (
    <Checkbox
      size={size}
      aria-label={label}
      checked={Boolean(selection[row.id])}
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
