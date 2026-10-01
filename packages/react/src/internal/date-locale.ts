import { CalendarDate, DateFormatter, getDayOfWeek } from '@internationalized/date';
import { NumberFormatter } from '@internationalized/number';
import { memoize, range } from 'es-toolkit';

import { DEFAULT_LOCALE } from './messages';
import { invariant } from '../utils';

export type HourCycle = '12h' | '24h';
export type DatePart = 'y' | 'M' | 'd';
export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const SAMPLE_YEAR = 2000;
const A_SUNDAY = new CalendarDate(2024, 1, 7);
const DAYS_IN_WEEK = 7;

const canonicalTag = memoize((tag: string) => {
  try {
    return Intl.getCanonicalLocales(tag)[0];
  } catch {
    return undefined;
  }
});

export function resolveLocale(locale: string = DEFAULT_LOCALE): string {
  const canonical = typeof locale === 'string' ? canonicalTag(locale) : undefined;
  const shown = typeof locale === 'string' ? `"${locale}"` : `of type ${typeof locale}`;
  invariant(
    canonical,
    `locale ${shown} is not a BCP 47 language tag. Pass a string such as 'ko-KR' or 'de-DE'.`,
  );

  return canonical;
}

export const dateFormatter = (locale: string, options: Intl.DateTimeFormatOptions = {}) =>
  new DateFormatter(locale, options);

export const numberFormatter = (locale: string, options: Intl.NumberFormatOptions = {}) =>
  new NumberFormatter(locale, options);

const partOf = (parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes) =>
  parts.find((part) => part.type === type)?.value;

export const formatPart = (
  date: Date,
  type: Intl.DateTimeFormatPartTypes,
  locale: string,
  options: Intl.DateTimeFormatOptions,
) => partOf(dateFormatter(locale, options).formatToParts(date), type) ?? '';

export function hourCycleOf(locale: string): HourCycle {
  const { hourCycle } = dateFormatter(locale, { hour: 'numeric' }).resolvedOptions();
  return hourCycle === 'h11' || hourCycle === 'h12' ? '12h' : '24h';
}

const twelveHourParts = (locale: string, hour: number) =>
  dateFormatter(locale, { hour: 'numeric', minute: '2-digit', hour12: true }).formatToParts(
    new Date(SAMPLE_YEAR, 0, 1, hour),
  );

export const periodFirst = memoize((locale: string) => {
  const types = twelveHourParts(locale, 0).map((part) => part.type);
  const period = types.indexOf('dayPeriod');
  return period !== -1 && period < types.indexOf('hour');
});

export const periodLabel = (period: number, locale: string) =>
  partOf(twelveHourParts(locale, period * 12), 'dayPeriod') ?? (period ? 'PM' : 'AM');

export const numericDate: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
};

const partLetter: Partial<Record<Intl.DateTimeFormatPartTypes, DatePart>> = {
  year: 'y',
  month: 'M',
  day: 'd',
};

export const numericDateParts = (locale: string) =>
  dateFormatter(locale, numericDate).formatToParts(new Date(SAMPLE_YEAR, 11, 31));

export const dateOrder = memoize((locale: string): DatePart[] => {
  const order = numericDateParts(locale).flatMap((part) => partLetter[part.type] ?? []);
  return order.length === 3 ? order : ['y', 'M', 'd'];
});

const foldCase = (word: string, locale: string) =>
  word.normalize('NFKC').toLocaleLowerCase(locale).replace(/\.$/, '');

const monthNames = memoize((locale: string): Map<string, number> => {
  const names = new Map<string, number>();
  const widths = ['long', 'short'] as const;
  for (const month of range(1, 13)) {
    const date = new Date(SAMPLE_YEAR, month - 1, 1);
    for (const width of widths) {
      const standalone = dateFormatter(locale, { month: width }).format(date);
      const inDate = formatPart(date, 'month', locale, { day: 'numeric', month: width });
      for (const name of [standalone, inDate]) names.set(foldCase(name, locale), month);
    }
  }

  return names;
});

export const monthNamed = (word: string, locale: string) =>
  monthNames(locale).get(foldCase(word, locale));

export const nativeDigits = memoize((locale: string): Map<string, number> => {
  const digits = numberFormatter(locale, { useGrouping: false });
  return new Map(range(10).map((digit) => [digits.format(digit), digit]));
});

export const weekStartOf = (locale: string) =>
  ((DAYS_IN_WEEK - getDayOfWeek(A_SUNDAY, locale)) % DAYS_IN_WEEK) as WeekDay;
