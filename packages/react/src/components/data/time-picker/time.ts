import { invariant } from '../../../utils';
import { dateFormat, dayKey, validDate } from '../calendar/date';

export type TimePrecision = 'hour' | 'minute' | 'second';
export type TimeFormat = '12h' | '24h';
export type TimeUnit = 'hour' | 'minute' | 'second' | 'period';

export const secondsOf = (d: Date) => d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
export const timeKey = (d: Date, precision: TimePrecision = 'minute') =>
  [
    d.getHours(),
    ...(precision === 'hour' ? [] : [d.getMinutes()]),
    ...(precision === 'second' ? [d.getSeconds()] : []),
  ]
    .map((n) => String(n).padStart(2, '0'))
    .join(':');

// setHours() on a day that skips an hour for DST lands on another hour instead of failing, so
// the result is checked against what was asked for.
export function withTime(day: Date, seconds: number): Date | null {
  const next = new Date(day);
  next.setHours(Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60, 0);
  return dayKey(next) === dayKey(day) && secondsOf(next) === seconds ? next : null;
}

export function validateTime(value: Date | null | undefined) {
  invariant(value == null || validDate(value), 'TimePicker: expected a valid Date or null.');
}

export function resolveTimeFormat(format: TimeFormat | undefined, locale: string): TimeFormat {
  return (
    format ??
    (new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions().hour12 ? '12h' : '24h')
  );
}

export function periodLabel(period: number, locale: string): string {
  return (
    dateFormat(locale, { hour: 'numeric', hour12: true })
      .formatToParts(new Date(2000, 0, 1, period * 12))
      .find((p) => p.type === 'dayPeriod')?.value ?? (period ? 'PM' : 'AM')
  );
}

/** Local clock slots; unavailable DST times are omitted, repeated times use Date's earlier offset. */
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
  const lo = min ? secondsOf(min) : 0,
    hi = max ? secondsOf(max) : 86399;
  invariant(lo <= hi, 'TimePicker: min must not be after max; overnight ranges are unsupported.');
  const slots: number[] = [];
  for (let hour = 0; hour < 24; hour++)
    for (
      let minute = 0;
      minute < (precision === 'hour' ? 1 : 60);
      minute += precision === 'minute' ? step : 1
    )
      for (
        let second = 0;
        second < (precision === 'second' ? 60 : 1);
        second += precision === 'second' ? step : 1
      ) {
        const s = hour * 3600 + minute * 60 + second;
        if (s >= lo && s <= hi && withTime(day, s)) slots.push(s);
      }
  return slots;
}

export function nearestSlot(slots: number[], target: number): number | undefined {
  let best: number | undefined;
  for (const slot of slots)
    if (best === undefined || Math.abs(slot - target) < Math.abs(best - target)) best = slot;
  return best;
}

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
  if (unit === 'hour')
    return Array.from({ length: format === '12h' ? 12 : 24 }, (_, i) =>
      format === '12h' ? i + 1 : i,
    );
  const interval = unit === precision ? step : 1;
  return Array.from({ length: Math.ceil(60 / interval) }, (_, i) => i * interval);
}

// Picking one unit keeps the others where they are and lands on the nearest allowed slot inside
// that choice, so 10 in the hour column after 09:45 with max 10:15 gives 10:15, not a gap.
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

const twoDigits = new Map<string, Intl.NumberFormat>();
export function unitLabel(unit: TimeUnit, n: number, locale: string) {
  if (unit === 'period') return periodLabel(n, locale);
  let format = twoDigits.get(locale);
  if (!format) {
    format = new Intl.NumberFormat(locale, { minimumIntegerDigits: 2, useGrouping: false });
    twoDigits.set(locale, format);
  }
  return format.format(n);
}

// Typing a number picks the first option that starts with it, so "4" finds 04 and "45" finds 45;
// when the buffer no longer matches anything, the last key starts a new search.
export function typeaheadMatch(labels: string[], buffer: string, from: number): number {
  const find = (query: string) => {
    const lower = query.toLocaleLowerCase();
    const order = [...labels.keys()].map((i) => (from + 1 + i) % labels.length);
    return order.find((i) => {
      const label = labels[i].toLocaleLowerCase();
      return label.startsWith(lower) || label.replace(/^0+(?=\d)/, '').startsWith(lower);
    });
  };
  // A repeated single key cycles through the matches instead of staying on the first one.
  const repeated = buffer.length > 1 && [...buffer].every((ch) => ch === buffer[0]);
  const index = repeated ? find(buffer[0]) : (find(buffer) ?? find(buffer.slice(-1)));
  return index ?? -1;
}
