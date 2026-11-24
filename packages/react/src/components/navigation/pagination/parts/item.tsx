'use client';

import type { ComponentProps } from 'react';

import { useInternalPaginationContext } from '../context';

export type PaginationItemProps = ComponentProps<'li'>;

export function PaginationItem({ className, ...props }: PaginationItemProps) {
  const { styles } = useInternalPaginationContext('Pagination.Item');
  return <li {...props} data-pagination-item="" className={styles.item({ className })} />;
}

PaginationItem.displayName = 'Pagination.Item';
