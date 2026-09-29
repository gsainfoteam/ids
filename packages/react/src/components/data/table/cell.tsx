'use client';

import { use, type ComponentProps } from 'react';

import { TableSectionContext, useTableContext, type TableAlign } from './context';

export type TableCellProps = Omit<ComponentProps<'td'>, 'align'> & { align?: TableAlign };

export function TableCell({ align = 'start', className, ...props }: TableCellProps) {
  const { styles } = useTableContext('Table.Cell');
  const section = use(TableSectionContext);

  return (
    <td
      {...props}
      data-table-cell=""
      data-align={align}
      className={styles.cell({ section, align, className })}
    />
  );
}

TableCell.displayName = 'Table.Cell';
