import { getYear, isValid, parse } from 'date-fns';
import { uniq } from 'es-toolkit';

import { shortDatePattern, tokensOf } from '../../../internal/date-locale';

import type { Locale } from 'date-fns';

type Part = 'y' | 'M' | 'd';

const orderOf = (locale: Locale) =>
  uniq(tokensOf(shortDatePattern(locale)).match(/[yMd]/g) ?? ['y', 'M', 'd']) as Part[];

export function parseDateText(text: string, locale: Locale, pattern?: string): Date | undefined {
  const input = text.normalize('NFKC').trim();
  if (!input) return undefined;
  const reference = new Date();
  const read = (value: string, candidate: string) => {
    const date = parse(value, candidate, reference, { locale });
    return isValid(date) ? date : undefined;
  };

  for (const candidate of [pattern, 'P', 'PP', 'PPP']) {
    const date = candidate && read(input, candidate);
    if (date && getYear(date) >= 1000) return date;
  }

  const order = orderOf(locale);
  const groups = input.match(/\d+/g) ?? [];
  if (groups.length === 3) {
    const sequence: Part[] = groups[0].length >= 3 ? ['y', 'M', 'd'] : order;
    const candidate = sequence
      .map((part, index) => (part === 'y' && groups[index].length <= 2 ? 'yy' : part))
      .join('-');
    return read(groups.join('-'), candidate);
  }
  const digits = groups.length === 1 ? groups[0] : '';
  if (digits.length === 8 || digits.length === 6) {
    const year = digits.length === 8 ? 'yyyy' : 'yy';
    const compact = order.map((part) => (part === 'y' ? year : part + part)).join('');
    return (digits.length === 8 ? read(digits, 'yyyyMMdd') : undefined) ?? read(digits, compact);
  }
  return undefined;
}

export const dateInputHint = (locale: Locale) =>
  shortDatePattern(locale).replace(
    /'([^']*)'|y+|M+|d+/g,
    (token, literal?: string) =>
      literal ?? (token[0] === 'y' ? 'YYYY' : token[0] === 'M' ? 'MM' : 'DD'),
  );
