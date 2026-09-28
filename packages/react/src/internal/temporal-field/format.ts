import { format as formatDate } from 'date-fns';

import { patternHourCycle, periodFirst, type HourCycle } from '../date-locale';

import type { TimePrecision } from '../../components/data/time-picker/time';
import type { Locale } from 'date-fns';

export type TemporalFormat = string | ((date: Date) => string);

export function timePattern(locale: Locale, precision: TimePrecision, cycle: HourCycle): string {
  const seconds = precision === 'second';
  const localesOwnTime = seconds ? 'pp' : 'p';
  if (cycle === patternHourCycle(locale)) return localesOwnTime;
  if (cycle === '24h') return seconds ? 'HH:mm:ss' : 'HH:mm';
  const clock = seconds ? 'h:mm:ss' : 'h:mm';
  return periodFirst(locale) ? `a ${clock}` : `${clock} a`;
}

export function formatter(value: TemporalFormat, locale: Locale): (date: Date) => string {
  if (typeof value === 'function') return value;
  return (date) => formatDate(date, value, { locale });
}
