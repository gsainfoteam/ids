'use client';

import { useDataTableContext } from './context';
import { useTranslate } from '../../../internal/translate';
import { Pagination } from '../../navigation/pagination';

import type { DataTableFeatures } from './features';
import type { ReactTable } from '@tanstack/react-table';
import type { RowData } from '@tanstack/table-core';

type FooterProps<TData extends RowData> = {
  table: ReactTable<DataTableFeatures, TData>;
  selectable: boolean;
  paginated: boolean;
};

export function DataTableFooter<TData extends RowData>({
  table,
  selectable,
  paginated,
}: FooterProps<TData>) {
  const t = useTranslate();
  const { styles, size } = useDataTableContext();

  const selected = Object.values(table.state.rowSelection).filter(Boolean).length;
  const pageCount = Math.max(table.getPageCount(), 1);
  const page = Math.min(table.state.pagination.pageIndex + 1, pageCount);

  return (
    <div data-data-table-footer="" className={styles.footer()}>
      {selectable && (
        <p aria-live="polite" data-data-table-summary="" className={styles.summary()}>
          {t('dataTable.selected', { count: selected })}
        </p>
      )}
      {paginated && (
        <Pagination
          page={page}
          pageCount={pageCount}
          onPageChange={(next) => table.setPageIndex(next - 1)}
          size={size}
          className={styles.pagination()}
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
                {t('dataTable.page', { page, count: pageCount })}
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
      )}
    </div>
  );
}
