import { describe, expect, test } from 'vitest';

import {
  normalizePage,
  paginationEntries,
  paginationRange,
} from '../src/components/navigation/pagination/range';

const E = '…';
const show = (items: ReturnType<typeof paginationRange>) =>
  items.map((item) => (typeof item === 'number' ? item : E));

describe('paginationRange', () => {
  test('shows every page while they fit in the slots', () => {
    expect(paginationRange({ page: 1, pageCount: 7 })).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(paginationRange({ page: 3, pageCount: 5 })).toEqual([1, 2, 3, 4, 5]);
    expect(paginationRange({ page: 1, pageCount: 1 })).toEqual([1]);
    expect(paginationRange({ page: 2, pageCount: 2 })).toEqual([1, 2]);
  });

  test('collapses the far side into one ellipsis near either end', () => {
    expect(show(paginationRange({ page: 1, pageCount: 20 }))).toEqual([1, 2, 3, 4, 5, E, 20]);
    expect(show(paginationRange({ page: 4, pageCount: 20 }))).toEqual([1, 2, 3, 4, 5, E, 20]);
    expect(show(paginationRange({ page: 20, pageCount: 20 }))).toEqual([1, E, 16, 17, 18, 19, 20]);
  });

  test('shows the siblings around the page with an ellipsis on each side', () => {
    expect(show(paginationRange({ page: 7, pageCount: 20 }))).toEqual([1, E, 6, 7, 8, E, 20]);
    expect(show(paginationRange({ page: 10, pageCount: 20, siblingCount: 2 }))).toEqual([
      1,
      E,
      8,
      9,
      10,
      11,
      12,
      E,
      20,
    ]);
  });

  test('never hides a single page behind an ellipsis', () => {
    expect(show(paginationRange({ page: 5, pageCount: 20 }))).toEqual([1, E, 4, 5, 6, E, 20]);
    expect(show(paginationRange({ page: 4, pageCount: 8 }))).toEqual([1, 2, 3, 4, 5, E, 8]);
    expect(show(paginationRange({ page: 5, pageCount: 8 }))).toEqual([1, E, 4, 5, 6, 7, 8]);
  });

  test('boundaryCount keeps that many pages at each end', () => {
    expect(show(paginationRange({ page: 10, pageCount: 20, boundaryCount: 2 }))).toEqual([
      1,
      2,
      E,
      9,
      10,
      11,
      E,
      19,
      20,
    ]);
    expect(show(paginationRange({ page: 10, pageCount: 20, boundaryCount: 0 }))).toEqual([
      E,
      9,
      10,
      11,
      E,
    ]);
    expect(show(paginationRange({ page: 1, pageCount: 20, boundaryCount: 0 }))).toEqual([
      1,
      2,
      3,
      4,
      E,
    ]);
  });

  test('siblingCount 0 leaves only the page between the boundaries', () => {
    expect(show(paginationRange({ page: 10, pageCount: 20, siblingCount: 0 }))).toEqual([
      1,
      E,
      10,
      E,
      20,
    ]);
  });

  test('clamps and rounds out-of-range input instead of throwing', () => {
    expect(paginationRange({ page: 99, pageCount: 5 })).toEqual([1, 2, 3, 4, 5]);
    expect(show(paginationRange({ page: -3, pageCount: 20 }))).toEqual([1, 2, 3, 4, 5, E, 20]);
    expect(show(paginationRange({ page: 7.8, pageCount: 20.5 }))).toEqual([1, E, 6, 7, 8, E, 20]);
    expect(paginationRange({ page: 1, pageCount: 0 })).toEqual([]);
    expect(paginationRange({ page: 1, pageCount: Number.NaN })).toEqual([]);
    expect(paginationRange({ page: 1, pageCount: 3, siblingCount: -1 })).toEqual([1, 2, 3]);
  });

  test('keeps its invariants for every page, count, sibling and boundary', () => {
    for (let pageCount = 1; pageCount <= 30; pageCount++)
      for (let siblingCount = 0; siblingCount <= 3; siblingCount++)
        for (let boundaryCount = 0; boundaryCount <= 3; boundaryCount++) {
          const slots = boundaryCount * 2 + siblingCount * 2 + 3;
          for (let page = 1; page <= pageCount; page++) {
            const items = paginationRange({ page, pageCount, siblingCount, boundaryCount });
            const pages = items.filter((item): item is number => typeof item === 'number');
            const context = { page, pageCount, siblingCount, boundaryCount };

            expect(pages, JSON.stringify(context)).toEqual([...pages].sort((a, b) => a - b));
            expect(new Set(pages).size, JSON.stringify(context)).toBe(pages.length);
            expect(pages, JSON.stringify(context)).toContain(page);
            if (pageCount <= slots) expect(items.length, JSON.stringify(context)).toBe(pageCount);
            else expect(items.length, JSON.stringify(context)).toBe(slots);

            for (let offset = -siblingCount; offset <= siblingCount; offset++) {
              const sibling = page + offset;
              if (sibling >= 1 && sibling <= pageCount)
                expect(pages, JSON.stringify(context)).toContain(sibling);
            }
            for (let edge = 1; edge <= Math.min(boundaryCount, pageCount); edge++) {
              expect(pages, JSON.stringify(context)).toContain(edge);
              expect(pages, JSON.stringify(context)).toContain(pageCount - edge + 1);
            }

            items.forEach((item, index) => {
              if (typeof item === 'number') return;
              const before = pages.filter((p) => items.indexOf(p) < index).at(-1) ?? 0;
              const after = pages.find((p) => items.indexOf(p) > index) ?? pageCount + 1;
              expect(after - before - 1, JSON.stringify(context)).toBeGreaterThanOrEqual(2);
            });
          }
        }
  });
});

describe('paginationEntries', () => {
  test('wraps the range with previous and next that stop at the ends', () => {
    expect(paginationEntries({ page: 1, pageCount: 3 })).toEqual([
      { type: 'previous', key: 'previous', page: 1, disabled: true },
      { type: 'page', key: 'page-1', page: 1, current: true },
      { type: 'page', key: 'page-2', page: 2, current: false },
      { type: 'page', key: 'page-3', page: 3, current: false },
      { type: 'next', key: 'next', page: 2, disabled: false },
    ]);
    expect(paginationEntries({ page: 3, pageCount: 3 }).at(-1)).toEqual({
      type: 'next',
      key: 'next',
      page: 3,
      disabled: true,
    });
  });

  test('keys each ellipsis by its side', () => {
    const keys = paginationEntries({ page: 10, pageCount: 20 }).map((entry) => entry.key);
    expect(keys).toEqual([
      'previous',
      'page-1',
      'start-ellipsis',
      'page-9',
      'page-10',
      'page-11',
      'end-ellipsis',
      'page-20',
      'next',
    ]);
  });
});

test('normalizePage clamps to 1..pageCount and treats an empty count as one page', () => {
  expect(normalizePage(0, 10)).toBe(1);
  expect(normalizePage(11, 10)).toBe(10);
  expect(normalizePage(4.6, 10)).toBe(4);
  expect(normalizePage(3, 0)).toBe(1);
});
