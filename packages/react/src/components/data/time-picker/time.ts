import { format, getHours, getMinutes, getSeconds, isSameDay, set } from 'date-fns';
import { minBy, range } from 'es-toolkit';

import { hourCycleOf, type HourCycle } from '../../../internal/date-locale';
import { invariant } from '../../../utils';
import { validDate } from '../calendar/date';

import type { Locale } from 'date-fns';

export type TimePrecision = 'hour' | 'minute' | 'second';
export type TimeFormat = HourCycle;
export type TimeUnit = 'hour' | 'minute' | 'second' | 'period';

export const secondsOf = (d: Date) => getHours(d) * 3600 + getMinutes(d) * 60 + getSeconds(d);

const keyPatterns = { hour: 'HH', minute: 'HH:mm', second: 'HH:mm:ss' } as const;
export const timeKey = (d: Date, precision: TimePrecision = 'minute') =>
  format(d, keyPatterns[precision]);

export function withTime(day: Date, seconds: number): Date | null {
  const next = set(day, {
    hours: Math.floor(seconds / 3600),
    minutes: Math.floor(seconds / 60) % 60,
    seconds: seconds % 60,
    milliseconds: 0,
  });
  const timeExistsThatDay = isSameDay(next, day) && secondsOf(next) === seconds;
  return timeExistsThatDay ? next : null;
}

export function validateTime(value: Date | null | undefined) {
  invariant(value == null || validDate(value), 'TimePicker: expected a valid Date or null.');
}

export const resolveTimeFormat = (value: TimeFormat | undefined, locale: Locale): TimeFormat =>
  value ?? hourCycleOf(locale);

export const periodLabel = (period: number, locale: Locale) =>
  format(new Date(2000, 0, 1, period * 12), 'a', { locale });

export function timeSlots(
  day: Date,
  precision: TimePrecision,
  step: number,
  min?: Date,
  max?: Date,
): number[] {
  validateTime(min);
  validateTime(max);
  invariant(
    Number.isInteger(step) && step >= 1 && step <= 60 && (precision !== 'hour' || step === 1),
    'TimePicker: step must be 1..60 and precision=hour requires step=1.',
  );
  const lo = min ? secondsOf(min) : 0;
  const hi = max ? secondsOf(max) : 86399;
  invariant(lo <= hi, 'TimePicker: min must not be after max; overnight ranges are unsupported.');
  const minutes = precision === 'hour' ? [0] : range(0, 60, precision === 'minute' ? step : 1);
  const seconds = precision === 'second' ? range(0, 60, step) : [0];
  return range(24)
    .flatMap((h) => minutes.flatMap((m) => seconds.map((s) => h * 3600 + m * 60 + s)))
    .filter((slot) => slot >= lo && slot <= hi && withTime(day, slot));
}

export const nearestSlot = (slots: number[], target: number): number | undefined =>
  minBy(slots, (slot) => Math.abs(slot - target));

export function unitValue(seconds: number, unit: TimeUnit, format: TimeFormat) {
  const hour = Math.floor(seconds / 3600);
  if (unit === 'hour') return format === '12h' ? hour % 12 || 12 : hour;
  if (unit === 'minute') return Math.floor(seconds / 60) % 60;
  if (unit === 'second') return seconds % 60;
  return Math.floor(hour / 12);
}

export function unitNumbers(
  unit: TimeUnit,
  format: TimeFormat,
  precision: TimePrecision,
  step: number,
) {
  if (unit === 'period') return [0, 1];
  if (unit === 'hour') return format === '12h' ? [12, ...range(1, 12)] : range(24);
  return range(0, 60, unit === precision ? step : 1);
}

export function unitTarget(
  unit: TimeUnit,
  n: number,
  current: number,
  slots: number[],
  format: TimeFormat,
): number | undefined {
  const hour = Math.floor(current / 3600);
  const minute = Math.floor(current / 60) % 60;
  const targetHour =
    unit === 'period'
      ? (hour % 12) + n * 12
      : unit === 'hour'
        ? format === '12h'
          ? (n % 12) + Math.floor(hour / 12) * 12
          : n
        : hour;
  const target =
    unit === 'minute'
      ? hour * 3600 + n * 60 + (current % 60)
      : unit === 'second'
        ? hour * 3600 + minute * 60 + n
        : targetHour * 3600 + (current % 3600);
  const matches = slots.filter(
    (s) =>
      (unit === 'period' ? Math.floor(s / 43200) === n : Math.floor(s / 3600) === targetHour) &&
      ((unit !== 'minute' && unit !== 'second') ||
        Math.floor(s / 60) % 60 === (unit === 'minute' ? n : minute)) &&
      (unit !== 'second' || s % 60 === n),
  );
  return nearestSlot(matches, target);
}

export const unitLabel = (unit: TimeUnit, n: number, locale: Locale) =>
  unit === 'period' ? periodLabel(n, locale) : String(n).padStart(2, '0');

export function typeaheadMatch(labels: string[], buffer: string, from: number): number {
  const find = (query: string) => {
    const lower = query.toLocaleLowerCase();
    const order = [...labels.keys()].map((i) => (from + 1 + i) % labels.length);
    return order.find((i) => {
      const label = labels[i].toLocaleLowerCase();
      return label.startsWith(lower) || label.replace(/^0+(?=\d)/, '').startsWith(lower);
    });
  };
  const repeated = buffer.length > 1 && [...buffer].every((ch) => ch === buffer[0]);
  const index = repeated ? find(buffer[0]) : (find(buffer) ?? find(buffer.slice(-1)));
  return index ?? -1;
}
