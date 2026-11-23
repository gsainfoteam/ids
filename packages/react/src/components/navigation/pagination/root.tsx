'use client';

import { PaginationContext, type PaginationContextValue } from './context';
import { useInternalPagination } from './hooks/use-pagination';
import { PaginationList } from './parts/list';
import { paginationStyle } from './style';
import { useInternalTranslate } from '../../../internal/translate';
import { mergeEventHandlers, mergeRefs } from '../../../utils';

import type { Pagination } from '.';

export function PaginationRoot({
  page: pageProp,
  defaultPage = 1,
  onPageChange,
  pageCount,
  siblingCount = 1,
  boundaryCount = 1,
  size = 'standard',
  variant = 'soft',
  disabled = false,
  getHref,
  ref,
  className,
  onKeyDown,
  children,
  ...props
}: Pagination.Props) {
  const t = useInternalTranslate();
  const pagination = useInternalPagination({
    page: pageProp,
    defaultPage,
    onPageChange,
    pageCount,
    disabled,
    getHref,
  });
  const styles = paginationStyle({ size });

  const context: PaginationContextValue = {
    page: pagination.page,
    pageCount: pagination.lastPage,
    siblingCount,
    boundaryCount,
    size,
    variant,
    disabled,
    getHref,
    setPage: pagination.setPage,
    styles,
  };

  return (
    <PaginationContext value={context}>
      <nav
        aria-label={t('pagination.label')}
        {...props}
        ref={mergeRefs(pagination.rootRef, ref)}
        data-size={size}
        data-disabled={disabled ? '' : undefined}
        className={styles.root({ className })}
        onKeyDown={mergeEventHandlers(onKeyDown, pagination.onKeyDown)}
      >
        {children ?? <PaginationList />}
      </nav>
    </PaginationContext>
  );
}
