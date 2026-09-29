'use client';

import { use, type ComponentProps } from 'react';

import { TableSectionContext, useTableContext } from './context';

export type TableRowProps = ComponentProps<'tr'> & { selected?: boolean };

export function TableRow({ selected = false, className, onClick, ...props }: TableRowProps) {
  const { styles, highlightOnHover } = useTableContext('Table.Row');
  const section = use(TableSectionContext);
  const inBody = section === 'body';
  const clickable = inBody && onClick != null;
  const hoverable = clickable || (inBody && highlightOnHover);

  return (
    <tr
      {...props}
      onClick={onClick}
      data-table-row=""
      data-selected={inBody && selected ? '' : undefined}
      data-hoverable={hoverable ? '' : undefined}
      className={styles.row({ section, hoverable, clickable, className })}
    />
  );
}

TableRow.displayName = 'Table.Row';
