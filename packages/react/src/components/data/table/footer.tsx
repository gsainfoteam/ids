'use client';

import { type ComponentProps } from 'react';

import { TableSectionContext, useTableContext } from './context';

export type TableFooterProps = ComponentProps<'tfoot'>;

export function TableFooter({ className, ...props }: TableFooterProps) {
  const { styles } = useTableContext('Table.Footer');
  return (
    <TableSectionContext value="footer">
      <tfoot {...props} data-table-footer="" className={styles.footer({ className })} />
    </TableSectionContext>
  );
}

TableFooter.displayName = 'Table.Footer';
