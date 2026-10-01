'use client';

import { useRef } from 'react';

import { DataTableColumnHeader } from './column-header';
import { DataTableContext } from './context';
import { DataTableFooter } from './footer';
import { SELECTION_COLUMN_ID } from './selection';
import { dataTableStyle } from './style';
import { useDataTable } from './use-data-table';
import { useTranslate } from '../../../internal/translate';
import { Spinner } from '../../feedback/spinner';
import { TableBody } from '../table/body';
import { TableCaption } from '../table/caption';
import { TableCell } from '../table/cell';
import { TableHeader } from '../table/header';
import { TableRoot } from '../table/root';
import { TableRow } from '../table/row';

import type { DataTable } from '.';
import type { RowData } from '@tanstack/table-core';

export function DataTableRoot<TData extends RowData>(props: DataTable.Props<TData>) {
  const {
    getRowLabel,
    variant = 'outline',
    size = 'standard',
    striped,
    stickyHeader,
    highlightOnHover,
    caption,
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    enableColumnResizing = false,
    loading = false,
    empty,
    className,
    style,
  } = props;

  const t = useTranslate();
  const rootRef = useRef<HTMLDivElement>(null);
  const { table, rtl, selectable, paginated } = useDataTable(props, rootRef);
  const styles = dataTableStyle({ variant, size, loading });

  const rows = table.getRowModel().rows;
  const leafColumns = table.getAllLeafColumns();
  const columnCount = Math.max(leafColumns.length, 1);

  return (
    <DataTableContext value={{ styles, size, rtl, getRowLabel }}>
      <div
        ref={rootRef}
        data-data-table=""
        data-loading={loading ? '' : undefined}
        className={styles.root({ className })}
        style={style}
      >
        <div className={styles.frame()}>
          <TableRoot
            id={id}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={ariaDescribedBy}
            aria-busy={loading || undefined}
            variant={variant}
            size={size}
            striped={striped}
            stickyHeader={stickyHeader}
            highlightOnHover={highlightOnHover}
            layout={enableColumnResizing ? 'fixed' : 'auto'}
          >
            {caption != null && <TableCaption>{caption}</TableCaption>}
            {enableColumnResizing && (
              <colgroup>
                {leafColumns.map((column) => (
                  <col key={column.id} style={{ width: column.getSize() }} />
                ))}
              </colgroup>
            )}
            <TableHeader>
              {table.getHeaderGroups().map((group) => (
                <TableRow key={group.id}>
                  {group.headers.map((header) => (
                    <DataTableColumnHeader key={header.id} header={header} />
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {rows.length > 0 ? (
                rows.map((row) => (
                  <TableRow key={row.id} selected={row.getIsSelected()}>
                    {row.getAllCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        align={cell.column.columnDef.meta?.align}
                        className={
                          cell.column.id === SELECTION_COLUMN_ID ? styles.selectCell() : undefined
                        }
                      >
                        <table.FlexRender cell={cell} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columnCount}
                    data-data-table-message=""
                    className={styles.message()}
                  >
                    {loading ? (
                      <Spinner className={styles.spinner()} />
                    ) : (
                      (empty ?? t('dataTable.empty'))
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </TableRoot>
          {loading && rows.length > 0 && (
            <div data-data-table-loading="" className={styles.overlay()}>
              <Spinner className={styles.spinner()} />
            </div>
          )}
        </div>
        {(selectable || paginated) && (
          <DataTableFooter table={table} selectable={selectable} paginated={paginated} />
        )}
      </div>
    </DataTableContext>
  );
}
