'use client';

import type { ComponentProps } from 'react';

import { usePaginationContext } from './context';

export type PaginationItemProps = ComponentProps<'li'>;

export function PaginationItem({ className, ...props }: PaginationItemProps) {
  const { styles } = usePaginationContext('Pagination.Item');
  return <li {...props} data-pagination-item="" className={styles.item({ className })} />;
}

PaginationItem.displayName = 'Pagination.Item';
