'use client';

import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/16/solid';

import { useDataTableContext } from './context';
import { useTranslate } from '../../../internal/translate';
import { IconButton } from '../../action/icon-button';

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
  const previous = table.getCanPreviousPage();
  const next = table.getCanNextPage();
  const pageButton = { variant: 'ghost', size, focusableWhenDisabled: true } as const;

  return (
    <div data-data-table-footer="" className={styles.footer()}>
      {selectable && (
        <p aria-live="polite" data-data-table-summary="" className={styles.summary()}>
          {t('dataTable.selected', { count: selected })}
        </p>
      )}
      {paginated && (
        <nav aria-label={t('dataTable.pagination')} className={styles.pagination()}>
          <IconButton
            {...pageButton}
            aria-label={t('dataTable.firstPage')}
            icon={<ChevronDoubleLeftIcon className={styles.pageIcon()} />}
            disabled={!previous}
            onClick={() => table.firstPage()}
          />
          <IconButton
            {...pageButton}
            aria-label={t('dataTable.previousPage')}
            icon={<ChevronLeftIcon className={styles.pageIcon()} />}
            disabled={!previous}
            onClick={() => table.previousPage()}
          />
          <span aria-live="polite" data-data-table-page="" className={styles.page()}>
            {t('dataTable.page', { page, count: pageCount })}
          </span>
          <IconButton
            {...pageButton}
            aria-label={t('dataTable.nextPage')}
            icon={<ChevronRightIcon className={styles.pageIcon()} />}
            disabled={!next}
            onClick={() => table.nextPage()}
          />
          <IconButton
            {...pageButton}
            aria-label={t('dataTable.lastPage')}
            icon={<ChevronDoubleRightIcon className={styles.pageIcon()} />}
            disabled={!table.getCanLastPage()}
            onClick={() => table.lastPage()}
          />
        </nav>
      )}
    </div>
  );
}
