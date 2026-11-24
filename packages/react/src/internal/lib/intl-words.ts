import { memoize } from 'es-toolkit';

export type DateTimeFieldName =
  'year' | 'month' | 'weekOfYear' | 'day' | 'hour' | 'minute' | 'second' | 'dayPeriod';

export type RelativeUnit = 'day' | 'week' | 'month';

const PERCENT_OF_ONE = 100;

const fieldNames = memoize(
  (locale: string) => new Intl.DisplayNames(locale, { type: 'dateTimeField' }),
);

const relativeFormat = memoize((key: string) => {
  const [locale, numeric] = key.split('|') as [string, 'auto' | 'always'];
  return new Intl.RelativeTimeFormat(locale, { numeric });
});

const numberFormat = memoize((key: string) => {
  const [locale, options] = key.split('|') as [string, string];
  return new Intl.NumberFormat(locale, JSON.parse(options) as Intl.NumberFormatOptions);
});

const formatNumber = (locale: string, value: number, options: Intl.NumberFormatOptions = {}) =>
  numberFormat(`${locale}|${JSON.stringify(options)}`).format(value);

export function intlWords(locale: string) {
  const number = (value: number) => formatNumber(locale, value);

  return {
    field: (name: DateTimeFieldName) => fieldNames(locale).of(name) ?? name,
    relative: (value: number, unit: RelativeUnit, numeric: 'auto' | 'always' = 'auto') =>
      relativeFormat(`${locale}|${numeric}`).format(value, unit),
    number,
    percent: (value: number) =>
      formatNumber(locale, value / PERCENT_OF_ONE, { style: 'percent', maximumFractionDigits: 0 }),
    signed: (value: number) => formatNumber(locale, value, { signDisplay: 'always' }),
    days: (count: number) =>
      formatNumber(locale, count, { style: 'unit', unit: 'day', unitDisplay: 'long' }),
    degrees: (value: number) =>
      formatNumber(locale, value, { style: 'unit', unit: 'degree', unitDisplay: 'long' }),
    pixels: (value: number) => `${number(value)}px`,
    ratio: (part: number, whole: number) => `${number(part)} / ${number(whole)}`,
  };
}

export type IntlWords = ReturnType<typeof intlWords>;
