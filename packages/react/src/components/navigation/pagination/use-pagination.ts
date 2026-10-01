'use client';

import { useEffect, useRef, type KeyboardEvent } from 'react';

import { lastPageOf, normalizePage } from './range';
import { useControllableState } from '../../../hooks/use-controllable-state';
import { keyHandler } from '../../../internal/keys';
import { isDevelopment } from '../../../utils/dev';

type Options = {
  page: number | undefined;
  defaultPage: number;
  onPageChange: ((page: number) => void) | undefined;
  pageCount: number;
  disabled: boolean;
  getHref: ((page: number) => string) | undefined;
};

const CONTROL = '[data-pagination-control]';

function isRtl(element: HTMLElement) {
  const direction = element.ownerDocument.defaultView?.getComputedStyle(element).direction;
  if (direction) return direction === 'rtl';
  return element.closest('[dir]')?.getAttribute('dir') === 'rtl';
}

function enabledControlFor(root: HTMLElement, target: number) {
  return [...root.querySelectorAll<HTMLElement>(`${CONTROL}[data-page="${target}"]`)].find(
    (control) => !control.matches(':disabled, [aria-disabled="true"]'),
  );
}

function usePageRangeWarning(page: number, pageCount: number) {
  useEffect(() => {
    if (!isDevelopment) return;
    if (page < 1) console.warn(`[IDS] Pagination: page (${page}) must be 1 or greater.`);
    else if (pageCount >= 1 && page > pageCount)
      console.warn(`[IDS] Pagination: page (${page}) is greater than pageCount (${pageCount}).`);
  }, [page, pageCount]);
}

export function usePagination({
  page: pageProp,
  defaultPage,
  onPageChange,
  pageCount,
  disabled,
  getHref,
}: Options) {
  const [rawPage, setPage] = useControllableState({
    value: pageProp,
    defaultValue: defaultPage,
    onValueChange: onPageChange,
  });
  const lastPage = lastPageOf(pageCount);
  const page = normalizePage(rawPage, lastPage);
  usePageRangeWarning(rawPage, pageCount);

  const rootRef = useRef<HTMLElement>(null);
  const focusCurrentAfterChange = useRef(false);

  useEffect(() => {
    if (!focusCurrentAfterChange.current) return;
    focusCurrentAfterChange.current = false;
    rootRef.current?.querySelector<HTMLElement>('[aria-current="page"]')?.focus();
  }, [page]);

  const goTo = (event: KeyboardEvent<HTMLElement>, target: number) => {
    if (disabled || target < 1 || target > lastPage || target === page) return false;
    const control = enabledControlFor(event.currentTarget, target);
    if (!control && getHref !== undefined) return false;
    const origin = (event.target as Element).closest(CONTROL);
    focusCurrentAfterChange.current = origin?.hasAttribute('data-pagination-page') ?? false;
    if (control) control.click();
    else setPage(target);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!(event.target as Element).closest(CONTROL)) return;
    keyHandler<HTMLElement>(
      {
        ArrowLeft: () => goTo(event, page - 1),
        ArrowRight: () => goTo(event, page + 1),
        Home: () => goTo(event, 1),
        End: () => goTo(event, lastPage),
      },
      { dir: isRtl(event.currentTarget) ? 'rtl' : 'ltr' },
    )(event);
  };

  return { page, lastPage, setPage, rootRef, onKeyDown };
}
