'use client';

import { use, type ComponentProps } from 'react';

import { TableSectionContext, useTableContext, type TableAlign } from './context';

export type TableHeadProps = Omit<ComponentProps<'th'>, 'align'> & { align?: TableAlign };

export function TableHead({ align = 'start', scope, className, ...props }: TableHeadProps) {
  const { styles } = useTableContext('Table.Head');
  const section = use(TableSectionContext);
  const headsARow = section !== 'header';

  return (
    <th
      {...props}
      scope={scope ?? (headsARow ? 'row' : 'col')}
      data-table-head=""
      data-align={align}
      className={styles.head({ section, align, className })}
    />
  );
}

TableHead.displayName = 'Table.Head';
