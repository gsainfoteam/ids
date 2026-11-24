'use client';

import { use } from 'react';

import { DataTableToolbarContext, useDataTableContext } from './context';
import { useIntlWords } from '../../../internal/translate';
import { Pagination } from '../../navigation/pagination';

import type { AccessibleName } from '../../../internal/accessible-name';

export type DataTablePaginationProps = { className?: string };

export function DataTablePagination({ className }: DataTablePaginationProps) {
  const words = useIntlWords();
  const { table, styles, size, labelling } = useDataTableContext();
  const inToolbar = use(DataTableToolbarContext);

  const pageCount = Math.max(table.getPageCount(), 1);
  const page = Math.min(table.state.pagination.pageIndex + 1, pageCount);

  const pager = (
    <Pagination
      {...({
        'aria-label': labelling['aria-label'],
        'aria-labelledby': labelling['aria-labelledby'],
      } as AccessibleName)}
      page={page}
      pageCount={pageCount}
      onPageChange={(next) => table.setPageIndex(next - 1)}
      size={size}
      data-data-table-pagination=""
      className={styles.pagination({ className })}
    >
      <Pagination.List>
        <Pagination.Item>
          <Pagination.First focusableWhenDisabled />
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Previous focusableWhenDisabled />
        </Pagination.Item>
        <Pagination.Item>
          <span aria-live="polite" data-data-table-page="" className={styles.page()}>
            {words.ratio(page, pageCount)}
          </span>
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Next focusableWhenDisabled />
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Last focusableWhenDisabled />
        </Pagination.Item>
      </Pagination.List>
    </Pagination>
  );

  if (inToolbar) return pager;
  return <div className={styles.bar()}>{pager}</div>;
}

DataTablePagination.displayName = 'DataTable.Pagination';
