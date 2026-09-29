import { clamp, range } from 'es-toolkit';

export type PaginationRangeItem = number | 'start-ellipsis' | 'end-ellipsis';

export type PaginationEntry =
  | { type: 'previous'; key: 'previous'; page: number; disabled: boolean }
  | { type: 'page'; key: `page-${number}`; page: number; current: boolean }
  | { type: 'ellipsis'; key: 'start-ellipsis' | 'end-ellipsis'; position: 'start' | 'end' }
  | { type: 'next'; key: 'next'; page: number; disabled: boolean };

export type PaginationRangeOptions = {
  page: number;
  pageCount: number;
  siblingCount?: number;
  boundaryCount?: number;
};

const wholeAtLeast = (value: number, min: number) =>
  Number.isFinite(value) ? Math.max(min, Math.floor(value)) : min;

const inclusive = (start: number, end: number) => (start > end ? [] : range(start, end + 1));

export const lastPageOf = (pageCount: number) => wholeAtLeast(pageCount, 1);

export const normalizePage = (page: number, pageCount: number) =>
  clamp(wholeAtLeast(page, 1), 1, lastPageOf(pageCount));

export function paginationRange({
  page,
  pageCount,
  siblingCount = 1,
  boundaryCount = 1,
}: PaginationRangeOptions): PaginationRangeItem[] {
  const count = wholeAtLeast(pageCount, 0);
  if (count === 0) return [];

  const current = normalizePage(page, count);
  const siblings = wholeAtLeast(siblingCount, 0);
  const boundary = wholeAtLeast(boundaryCount, 0);

  const startPages = inclusive(1, Math.min(boundary, count));
  const endPages = inclusive(Math.max(count - boundary + 1, boundary + 1), count);

  const firstAfterStartGap = boundary + 2;
  const lastBeforeEndGap = count - boundary - 1;
  const windowStart = Math.max(
    Math.min(current - siblings, count - boundary - siblings * 2 - 1),
    firstAfterStartGap,
  );
  const windowEnd = Math.min(
    Math.max(current + siblings, boundary + siblings * 2 + 2),
    lastBeforeEndGap,
  );

  const pageAfterStart = boundary + 1;
  const pageBeforeEnd = count - boundary;
  const startGap: PaginationRangeItem[] =
    windowStart > firstAfterStartGap
      ? ['start-ellipsis']
      : pageAfterStart < pageBeforeEnd
        ? [pageAfterStart]
        : [];
  const endGap: PaginationRangeItem[] =
    windowEnd < lastBeforeEndGap
      ? ['end-ellipsis']
      : pageBeforeEnd > boundary
        ? [pageBeforeEnd]
        : [];

  return [...startPages, ...startGap, ...inclusive(windowStart, windowEnd), ...endGap, ...endPages];
}

export function paginationEntries(options: PaginationRangeOptions): PaginationEntry[] {
  const lastPage = lastPageOf(options.pageCount);
  const current = normalizePage(options.page, lastPage);

  const pages = paginationRange(options).map((item): PaginationEntry => {
    if (item === 'start-ellipsis' || item === 'end-ellipsis')
      return { type: 'ellipsis', key: item, position: item === 'start-ellipsis' ? 'start' : 'end' };
    return { type: 'page', key: `page-${item}`, page: item, current: item === current };
  });

  return [
    { type: 'previous', key: 'previous', page: Math.max(1, current - 1), disabled: current <= 1 },
    ...pages,
    {
      type: 'next',
      key: 'next',
      page: Math.min(lastPage, current + 1),
      disabled: current >= lastPage,
    },
  ];
}
