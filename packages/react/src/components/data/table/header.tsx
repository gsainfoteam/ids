'use client';

import { type ComponentProps } from 'react';

import { TableSectionContext, useTableContext } from './context';

export type TableHeaderProps = ComponentProps<'thead'>;

export function TableHeader({ className, ...props }: TableHeaderProps) {
  const { styles } = useTableContext('Table.Header');
  return (
    <TableSectionContext value="header">
      <thead {...props} data-table-header="" className={styles.header({ className })} />
    </TableSectionContext>
  );
}

TableHeader.displayName = 'Table.Header';
