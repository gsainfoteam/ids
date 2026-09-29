'use client';

import { type ComponentProps } from 'react';

import { useTableContext } from './context';

export type TableCaptionProps = ComponentProps<'caption'>;

export function TableCaption({ className, ...props }: TableCaptionProps) {
  const { styles } = useTableContext('Table.Caption');
  return <caption {...props} data-table-caption="" className={styles.caption({ className })} />;
}

TableCaption.displayName = 'Table.Caption';
