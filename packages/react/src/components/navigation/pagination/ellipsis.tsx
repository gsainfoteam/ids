'use client';

import type { ComponentProps } from 'react';

import { EllipsisHorizontalIcon } from '@heroicons/react/16/solid';

import { usePaginationContext } from './context';

export type PaginationEllipsisProps = ComponentProps<'span'>;

export function PaginationEllipsis({ className, children, ...props }: PaginationEllipsisProps) {
  const { styles } = usePaginationContext('Pagination.Ellipsis');
  return (
    <span
      aria-hidden="true"
      {...props}
      data-pagination-ellipsis=""
      className={styles.ellipsis({ className })}
    >
      {children ?? <EllipsisHorizontalIcon />}
    </span>
  );
}

PaginationEllipsis.displayName = 'Pagination.Ellipsis';
