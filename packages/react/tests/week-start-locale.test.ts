import { expect, test } from 'vitest';

import { withWeekStart } from '../src/internal/date-locale';

test('withWeekStart replaces or adds the -u-fw- keyword and keeps every other subtag', () => {
  expect(withWeekStart('ko-KR', 1)).toBe('ko-KR-u-fw-mon');
  expect(withWeekStart('ko-KR-u-fw-mon', 0)).toBe('ko-KR-u-fw-sun');
  expect(withWeekStart('ko-KR-u-ca-japanese-fw-mon', 0)).toBe('ko-KR-u-ca-japanese-fw-sun');
  expect(withWeekStart('ar-EG-u-nu-arab', 6)).toBe('ar-EG-u-fw-sat-nu-arab');
  expect(withWeekStart('ko-KR-u-fw-mon-x-foo', 0)).toBe('ko-KR-u-fw-sun-x-foo');
  expect(withWeekStart('en-US-u-fw-mon-t-ja', 0)).toBe('en-US-t-ja-u-fw-sun');
});
