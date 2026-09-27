import { getYear, isValid, parse } from 'date-fns';
import { uniq } from 'es-toolkit';

import { shortDatePattern, tokensOf } from '../../../internal/date-locale';

import type { Locale } from 'date-fns';

type Part = 'y' | 'M' | 'd';

const orderOf = (locale: Locale) =>
  uniq(tokensOf(shortDatePattern(locale)).match(/[yMd]/g) ?? ['y', 'M', 'd']) as Part[];

// Reads a typed date with date-fns: first as the field shows it and as the locale writes dates
// out (2026.09.15, 2026년 9월 15일, Sep 15, 2026), then by its numbers alone. Three numbers go in
// the locale's order unless the first is a year of three or more digits (2026. 9. 15. or
// 2026-09-15 anywhere), and one run of eight or six digits is what a phone keypad types.
export function parseDateText(text: string, locale: Locale, pattern?: string): Date | undefined {
  const input = text.normalize('NFKC').trim();
  if (!input) return undefined;
  const reference = new Date();
  const read = (value: string, candidate: string) => {
    const date = parse(value, candidate, reference, { locale });
    return isValid(date) ? date : undefined;
  };

  // A weekday name is left out: date-fns would move the date to that weekday instead of refusing
  // a mismatch.
  for (const candidate of [pattern, 'P', 'PP', 'PPP']) {
    const date = candidate && read(input, candidate);
    // Under y a two-digit year is the year 26; the numeric pass below reads it as 2026.
    if (date && getYear(date) >= 1000) return date;
  }

  const order = orderOf(locale);
  const groups = input.match(/\d+/g) ?? [];
  if (groups.length === 3) {
    const sequence: Part[] = groups[0].length >= 3 ? ['y', 'M', 'd'] : order;
    // yy reads 26 as the nearest 2026 rather than the year 26.
    const candidate = sequence
      .map((part, index) => (part === 'y' && groups[index].length <= 2 ? 'yy' : part))
      .join('-');
    return read(groups.join('-'), candidate);
  }
  const digits = groups.length === 1 ? groups[0] : '';
  if (digits.length === 8 || digits.length === 6) {
    const year = digits.length === 8 ? 'yyyy' : 'yy';
    const compact = order.map((part) => (part === 'y' ? year : part + part)).join('');
    // Eight digits are tried year first, so 20260915 reads the same in every locale while
    // 09152026 still reads as en-US.
    return (digits.length === 8 ? read(digits, 'yyyyMMdd') : undefined) ?? read(digits, compact);
  }
  return undefined;
}

// What an empty date input shows: the locale's numeric date with letters for the digits,
// YYYY.MM.DD in ko and MM/DD/YYYY in en-US.
export const dateInputHint = (locale: Locale) =>
  shortDatePattern(locale).replace(
    /'([^']*)'|y+|M+|d+/g,
    (token, literal?: string) =>
      literal ?? (token[0] === 'y' ? 'YYYY' : token[0] === 'M' ? 'MM' : 'DD'),
  );
