import { Time } from '@internationalized/date';
import { isFunction, minBy, range } from 'es-toolkit';

import { hourCycleOf, periodLabel, type HourCycle } from '../../../internal/date-locale';
import { invariant } from '../../../utils';

export type { HourCycle } from '../../../internal/date-locale';
export type TimePrecision = 'hour' | 'minute' | 'second';
export type TimeUnit = 'hour' | 'minute' | 'second' | 'period';

const SECONDS_IN_HOUR = 3600;
const LAST_SECOND_OF_DAY = 86399;
const SAMPLE_YEAR = 2000;
const TIME_FIELDS = ['hour', 'minute', 'second', 'millisecond'] as const;

export const isTime = (value: unknown): value is Time =>
  typeof value === 'object' &&
  value !== null &&
  TIME_FIELDS.every((field) => Number.isInteger((value as Record<string, unknown>)[field])) &&
  isFunction((value as { compare?: unknown }).compare);

export function validateTime(value: unknown, owner = 'TimePicker') {
  invariant(
    value == null || isTime(value),
    `${owner}: expected a Time from @internationalized/date (new Time(14, 30)) or null.`,
  );
}

export const sameTime = (a: Time | null, b: Time | null) =>
  a === b || (!!a && !!b && a.compare(b) === 0);

export const secondsOf = (time: Time) =>
  time.hour * SECONDS_IN_HOUR + time.minute * 60 + time.second;

export const timeOfSeconds = (seconds: number) =>
  new Time(Math.floor(seconds / SECONDS_IN_HOUR), Math.floor(seconds / 60) % 60, seconds % 60);

const twoDigits = (n: number) => String(n).padStart(2, '0');

const keyParts = { hour: 1, minute: 2, second: 3 } as const;

export const timeKey = (time: Time, precision: TimePrecision = 'minute') =>
  [time.hour, time.minute, time.second].slice(0, keyParts[precision]).map(twoDigits).join(':');

export const onUtcSampleDay = (time: Time) =>
  new Date(Date.UTC(SAMPLE_YEAR, 0, 1, time.hour, time.minute, time.second, time.millisecond));

export const resolveHourCycle = (value: HourCycle | undefined, locale: string): HourCycle =>
  value ?? hourCycleOf(locale);

export function timeSlots(
  precision: TimePrecision,
  step: number,
  min?: Time,
  max?: Time,
): number[] {
  validateTime(min);
  validateTime(max);
  invariant(
    Number.isInteger(step) && step >= 1 && step <= 60 && (precision !== 'hour' || step === 1),
    'TimePicker: step must be 1..60 and precision=hour requires step=1.',
  );

  const lo = min ? secondsOf(min) : 0;
  const hi = max ? secondsOf(max) : LAST_SECOND_OF_DAY;
  invariant(lo <= hi, 'TimePicker: min must not be after max; overnight ranges are unsupported.');

  const minutes = precision === 'hour' ? [0] : range(0, 60, precision === 'minute' ? step : 1);
  const seconds = precision === 'second' ? range(0, 60, step) : [0];
  return range(24)
    .flatMap((h) => minutes.flatMap((m) => seconds.map((s) => h * SECONDS_IN_HOUR + m * 60 + s)))
    .filter((slot) => slot >= lo && slot <= hi);
}

export const nearestSlot = (slots: number[], target: number): number | undefined =>
  minBy(slots, (slot) => Math.abs(slot - target));

export function unitValue(seconds: number, unit: TimeUnit, hourCycle: HourCycle) {
  const hour = Math.floor(seconds / 3600);
  if (unit === 'hour') return hourCycle === '12h' ? hour % 12 || 12 : hour;
  if (unit === 'minute') return Math.floor(seconds / 60) % 60;
  if (unit === 'second') return seconds % 60;
  return Math.floor(hour / 12);
}

export function unitNumbers(
  unit: TimeUnit,
  hourCycle: HourCycle,
  precision: TimePrecision,
  step: number,
) {
  if (unit === 'period') return [0, 1];
  if (unit === 'hour') return hourCycle === '12h' ? [12, ...range(1, 12)] : range(24);
  return range(0, 60, unit === precision ? step : 1);
}

export function unitTarget(
  unit: TimeUnit,
  n: number,
  current: number,
  slots: number[],
  hourCycle: HourCycle,
): number | undefined {
  const hour = Math.floor(current / 3600);
  const minute = Math.floor(current / 60) % 60;
  const targetHour =
    unit === 'period'
      ? (hour % 12) + n * 12
      : unit === 'hour'
        ? hourCycle === '12h'
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

export const unitLabel = (unit: TimeUnit, n: number, locale: string) =>
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
