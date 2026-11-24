'use client';

import { type ComponentProps } from 'react';

import { TableSectionContext, useInternalTableContext } from '../context';

export type TableFooterProps = ComponentProps<'tfoot'>;

export function TableFooter({ className, ...props }: TableFooterProps) {
  const { styles } = useInternalTableContext('Table.Footer');
  return (
    <TableSectionContext value="footer">
      <tfoot {...props} data-table-footer="" className={styles.footer({ className })} />
    </TableSectionContext>
  );
}

TableFooter.displayName = 'Table.Footer';
