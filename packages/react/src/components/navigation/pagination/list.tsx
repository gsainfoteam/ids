'use client';

import {
  cloneElement,
  isValidElement,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from 'react';

import { usePaginationContext } from './context';
import { PaginationEllipsis } from './ellipsis';
import { PaginationItem } from './item';
import { PaginationLink } from './link';
import { PaginationNext } from './next';
import { PaginationPrevious } from './previous';
import { paginationEntries, type PaginationEntry } from './range';
import { elementTypeOf } from '../../../utils';

export type PaginationListProps = Omit<ComponentProps<'ul'>, 'children'> & {
  children?: ReactNode | ((entry: PaginationEntry) => ReactNode);
};

function defaultEntry(entry: PaginationEntry) {
  switch (entry.type) {
    case 'previous':
      return <PaginationPrevious />;
    case 'next':
      return <PaginationNext />;
    case 'ellipsis':
      return <PaginationEllipsis />;
    case 'page':
      return <PaginationLink page={entry.page} />;
  }
}

const isItem = (node: ReactNode): node is ReactElement =>
  isValidElement(node) && elementTypeOf(node) === PaginationItem;

export function PaginationList({ className, children, ...props }: PaginationListProps) {
  const { page, pageCount, siblingCount, boundaryCount, styles } =
    usePaginationContext('Pagination.List');

  const renderEntry = typeof children === 'function' ? children : defaultEntry;
  const entries =
    children === undefined || typeof children === 'function'
      ? paginationEntries({ page, pageCount, siblingCount, boundaryCount }).map((entry) => {
          const node = renderEntry(entry);
          return isItem(node) ? (
            cloneElement(node, { key: entry.key })
          ) : (
            <PaginationItem key={entry.key}>{node}</PaginationItem>
          );
        })
      : children;

  return (
    <ul {...props} className={styles.list({ className })}>
      {entries}
    </ul>
  );
}

PaginationList.displayName = 'Pagination.List';
