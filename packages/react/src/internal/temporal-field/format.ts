import { dateFormatter, numericDate, type HourCycle } from '../date-locale';

import type { TimePrecision } from '../../components/data/time-picker/time';

export type TemporalFormat<V = Date> =
  | Intl.DateTimeFormatOptions
  | ((value: V, locale: string) => string);

export const dateOptions = numericDate;

export const timeOptions = (precision: TimePrecision): Intl.DateTimeFormatOptions => ({
  hour: 'numeric',
  ...(precision !== 'hour' && { minute: '2-digit' }),
  ...(precision === 'second' && { second: '2-digit' }),
});

const showsHour = (options: Intl.DateTimeFormatOptions) =>
  options.hour !== undefined || options.timeStyle !== undefined;

const choosesItsOwnCycle = (options: Intl.DateTimeFormatOptions) =>
  options.hour12 !== undefined || options.hourCycle !== undefined;

const withHourCycle = (
  options: Intl.DateTimeFormatOptions,
  cycle: HourCycle | undefined,
): Intl.DateTimeFormatOptions =>
  cycle && showsHour(options) && !choosesItsOwnCycle(options)
    ? { ...options, hour12: cycle === '12h' }
    : options;

export function formatter(
  format: TemporalFormat | undefined,
  locale: string,
  defaults: Intl.DateTimeFormatOptions,
  cycle?: HourCycle,
): (date: Date) => string {
  if (typeof format === 'function') return (date) => format(date, locale);

  const intl = dateFormatter(locale, withHourCycle(format ?? defaults, cycle));
  return (date) => intl.format(date);
}
