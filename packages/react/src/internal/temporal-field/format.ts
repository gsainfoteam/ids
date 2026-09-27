import { format as formatDate } from 'date-fns';

import { hourCycleOf, periodFirst, type HourCycle } from '../date-locale';

import type { TimePrecision } from '../../components/data/time-picker/time';
import type { Locale } from 'date-fns';

// A date-fns pattern such as "yyyy-MM-dd HH:mm", or a function for anything a pattern cannot say.
export type TemporalFormat = string | ((date: Date) => string);

// The locale's own short or medium time when it already uses the asked-for clock; otherwise the
// clock is spelled out, with the day period on the side the locale writes it.
export function timePattern(locale: Locale, precision: TimePrecision, cycle: HourCycle): string {
  const seconds = precision === 'second';
  if (cycle === hourCycleOf(locale)) return seconds ? 'pp' : 'p';
  if (cycle === '24h') return seconds ? 'HH:mm:ss' : 'HH:mm';
  const clock = seconds ? 'h:mm:ss' : 'h:mm';
  return periodFirst(locale) ? `a ${clock}` : `${clock} a`;
}

export function formatter(value: TemporalFormat, locale: Locale): (date: Date) => string {
  if (typeof value === 'function') return value;
  return (date) => formatDate(date, value, { locale });
}
