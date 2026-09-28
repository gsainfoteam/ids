import { minBy, sum } from 'es-toolkit';

import {
  dateOrder,
  monthNamed,
  nativeDigits,
  numericDateParts,
  type DatePart,
} from '../../../internal/date-locale';

type Fields = Record<DatePart, string>;

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const WORD = /\p{L}[\p{L}\p{M}]*\.?/gu;
const NATIVE_DIGIT = /\p{Nd}/gu;
const FALLBACK_MONTH_LOCALE = 'en-US';
const YEARS_IN_CENTURY = 100;
const YEAR_FIRST: DatePart[] = ['y', 'M', 'd'];

const hintOf: Partial<Record<Intl.DateTimeFormatPartTypes, string>> = {
  year: 'YYYY',
  month: 'MM',
  day: 'DD',
};

function withLatinDigits(text: string, locale: string) {
  const digits = nativeDigits(locale);
  return text.replace(NATIVE_DIGIT, (digit) => String(digits.get(digit) ?? digit));
}

function nearestYear(twoDigits: number) {
  const thisYear = new Date().getFullYear();
  const century = thisYear - (thisYear % YEARS_IN_CENTURY);
  const candidates = [-YEARS_IN_CENTURY, 0, YEARS_IN_CENTURY].map(
    (shift) => century + shift + twoDigits,
  );
  return minBy(candidates, (year) => Math.abs(year - thisYear))!;
}

function dateOf({ y, M, d }: Fields): Date | undefined {
  const readableYear = y.length <= 2 || y.length === 4;
  if (M.length > 2 || d.length > 2 || !readableYear) return undefined;

  const year = y.length <= 2 ? nearestYear(Number(y)) : Number(y);
  const month = Number(M);
  const day = Number(d);
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(0, 0, 0, 0);

  const sameFields =
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  return sameFields ? date : undefined;
}

const fieldsInOrder = (groups: string[], order: DatePart[]) =>
  Object.fromEntries(order.map((part, index) => [part, groups[index]])) as Fields;

function monthIn(text: string, locale: string) {
  for (const word of text.match(WORD) ?? []) {
    const month = monthNamed(word, locale) ?? monthNamed(word, FALLBACK_MONTH_LOCALE);
    if (month) return month;
  }

  return undefined;
}

function withMonthName(groups: string[], month: number, locale: string) {
  if (groups.length !== 2) return undefined;

  const yearIndex = groups.findIndex((group) => group.length >= 3);
  const order = dateOrder(locale).filter((part) => part !== 'M');
  const [first, second] =
    yearIndex === -1 ? order : yearIndex === 0 ? (['y', 'd'] as const) : (['d', 'y'] as const);
  return dateOf({ [first]: groups[0], [second]: groups[1], M: String(month) } as Fields);
}

function compact(digits: string, locale: string) {
  const order = dateOrder(locale);
  const split = (sequence: DatePart[], yearLength: number) => {
    const widths = sequence.map((part) => (part === 'y' ? yearLength : 2));
    const groups = widths.map((width, index) => {
      const start = sum(widths.slice(0, index));
      return digits.slice(start, start + width);
    });
    return dateOf(fieldsInOrder(groups, sequence));
  };

  if (digits.length === 8) return split(YEAR_FIRST, 4) ?? split(order, 4);
  if (digits.length === 6) return split(order, 2);
  return undefined;
}

export function parseDateText(text: string, locale: string): Date | undefined {
  const input = withLatinDigits(text.normalize('NFKC').trim(), locale);
  if (!input) return undefined;

  const iso = ISO_DATE.exec(input);
  if (iso) return dateOf({ y: iso[1], M: iso[2], d: iso[3] });

  const groups = input.match(/\d+/g) ?? [];
  const month = monthIn(input, locale);
  if (month) return withMonthName(groups, month, locale);

  if (groups.length === 3) {
    const startsWithYear = groups[0].length >= 3;
    return dateOf(fieldsInOrder(groups, startsWithYear ? YEAR_FIRST : dateOrder(locale)));
  }

  return groups.length === 1 ? compact(groups[0], locale) : undefined;
}

export const dateInputHint = (locale: string) =>
  numericDateParts(locale)
    .map((part) => hintOf[part.type] ?? part.value)
    .join('');
