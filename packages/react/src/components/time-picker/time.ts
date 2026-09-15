import { invariant } from '../../utils';
import { dayKey, validDate } from '../calendar/date';

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
    new Intl.DateTimeFormat(locale, { hour: 'numeric', hour12: true })
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
