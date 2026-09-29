'use client';

import { type ComponentProps } from 'react';

import { TableSectionContext, useTableContext } from './context';

export type TableBodyProps = ComponentProps<'tbody'>;

export function TableBody({ className, ...props }: TableBodyProps) {
  const { styles } = useTableContext('Table.Body');
  return (
    <TableSectionContext value="body">
      <tbody {...props} data-table-body="" className={styles.body({ className })} />
    </TableSectionContext>
  );
}

TableBody.displayName = 'Table.Body';
