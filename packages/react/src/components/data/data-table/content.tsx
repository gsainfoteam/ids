'use client';

import { DataTableColumnHeader } from './column-header';
import { useDataTableContext } from './context';
import { DataTableEmpty } from './empty';
import { SELECTION_COLUMN_ID } from './selection';
import { Spinner } from '../../feedback/spinner';
import { TableBody } from '../table/body';
import { TableCell } from '../table/cell';
import { TableHeader } from '../table/header';
import { TableRoot } from '../table/root';
import { TableRow } from '../table/row';

export type DataTableContentProps = { className?: string };

export function DataTableContent({ className }: DataTableContentProps) {
  const { table, styles, variant, size, busy, caption, empty, labelling } = useDataTableContext();

  const resizable = table.options.meta?.resizable ?? false;
  const rows = table.getRowModel().rows;
  const leafColumns = table.getAllLeafColumns();
  const columnCount = Math.max(leafColumns.length, 1);

  return (
    <div data-data-table-content="" className={styles.frame({ className })}>
      <TableRoot
        {...labelling}
        aria-busy={busy || undefined}
        variant={variant === 'ghost' ? 'ghost' : 'outline'}
        size={size}
        layout={resizable ? 'fixed' : 'auto'}
        className={styles.table()}
      >
        {caption}
        {resizable && (
          <colgroup>
            {leafColumns.map((column) => (
              <col key={column.id} style={{ width: column.getSize() }} />
            ))}
          </colgroup>
        )}
        <TableHeader className={styles.header()}>
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
              <TableRow key={row.id} selected={row.getIsSelected()} className={styles.row()}>
                {row.getAllCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    align={cell.column.columnDef.meta?.align}
                    className={styles.cell({
                      className:
                        cell.column.id === SELECTION_COLUMN_ID ? styles.selectCell() : undefined,
                    })}
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
                {busy ? <Spinner className={styles.spinner()} /> : (empty ?? <DataTableEmpty />)}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </TableRoot>
      {busy && rows.length > 0 && (
        <div data-data-table-loading="" className={styles.overlay()}>
          <Spinner className={styles.spinner()} />
        </div>
      )}
    </div>
  );
}

DataTableContent.displayName = 'DataTable.Content';
