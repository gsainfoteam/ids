'use client';

import { use, type AriaAttributes, type ComponentProps } from 'react';

import { TableSectionContext, useInternalTableContext } from '../context';

export type TableRowProps = ComponentProps<'tr'>;

function isOn(value: AriaAttributes['aria-selected'] | AriaAttributes['aria-current']) {
  return value != null && value !== false && value !== 'false';
}

export function TableRow({ className, onClick, ...props }: TableRowProps) {
  const { styles } = useInternalTableContext('Table.Row');
  const section = use(TableSectionContext);
  const inBody = section === 'body';
  const clickable = inBody && onClick != null;
  const marked = inBody && (isOn(props['aria-selected']) || isOn(props['aria-current']));

  return (
    <tr
      {...props}
      onClick={onClick}
      data-table-row=""
      data-selected={marked ? '' : undefined}
      data-hoverable={clickable ? '' : undefined}
      className={styles.row({ section, clickable, className })}
    />
  );
}

TableRow.displayName = 'Table.Row';
