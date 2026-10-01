import { CalendarDate, CalendarDateTime, Time } from '@internationalized/date';
import { isFunction } from 'es-toolkit';

import { invariant } from '../../../utils';
import {
  compareDays,
  dayKey,
  matchesAny,
  sameDay,
  type DateMatcher,
} from '../../data/calendar/date';
import {
  nearestSlot,
  secondsOf,
  timeKey,
  timeSlots,
  type TimePrecision,
} from '../../data/time-picker/time';

export type DateTimeLimits = {
  min?: CalendarDateTime;
  max?: CalendarDateTime;
  disabled?: DateMatcher | DateMatcher[];
  precision: TimePrecision;
  step: number;
};

const GREGORIAN = 'gregory';
const DATE_TIME_FIELDS = [
  'year',
  'month',
  'day',
  'hour',
  'minute',
  'second',
  'millisecond',
] as const;
const SECONDS_IN_HOUR = 3600;

type Shaped = Record<string, unknown> & { calendar?: { identifier?: unknown } };

export const isCalendarDateTime = (value: unknown): value is CalendarDateTime =>
  typeof value === 'object' &&
  value !== null &&
  DATE_TIME_FIELDS.every((field) => Number.isInteger((value as Shaped)[field])) &&
  typeof (value as Shaped).calendar?.identifier === 'string' &&
  isFunction((value as Shaped).compare);

export function validateDateTime(value: unknown) {
  if (value == null) return;

  invariant(
    isCalendarDateTime(value),
    'DateTimeField: expected a CalendarDateTime from @internationalized/date (new CalendarDateTime(2026, 9, 15, 14, 30)) or null.',
  );
  invariant(
    value.calendar.identifier === GREGORIAN,
    'DateTimeField: only gregorian dates are taken. Convert with toCalendar(value, new GregorianCalendar()).',
  );
}

export const ownDateTime = (value: CalendarDateTime) =>
  new CalendarDateTime(
    value.year,
    value.month,
    value.day,
    value.hour,
    value.minute,
    value.second,
    value.millisecond,
  );

export const dayOf = (value: CalendarDateTime) =>
  new CalendarDate(value.year, value.month, value.day);

export const timeOfDay = (value: CalendarDateTime) =>
  new Time(value.hour, value.minute, value.second, value.millisecond);

export const compareDateTimes = (a: CalendarDateTime, b: CalendarDateTime) =>
  ownDateTime(a).compare(ownDateTime(b));

export const sameInstant = (a: CalendarDateTime | null, b: CalendarDateTime | null) =>
  a === b || (!!a && !!b && compareDateTimes(a, b) === 0);

export const atSeconds = (day: CalendarDate, seconds: number) =>
  new CalendarDateTime(
    day.year,
    day.month,
    day.day,
    Math.floor(seconds / SECONDS_IN_HOUR),
    Math.floor(seconds / 60) % 60,
    seconds % 60,
  );

export const toUtcDateTime = (value: CalendarDateTime) => ownDateTime(value).toDate('UTC');

export const serializeDateTime = (value: CalendarDateTime, precision: TimePrecision) =>
  `${dayKey(dayOf(value))}T${timeKey(timeOfDay(value), precision)}`;

const ceilToWholeSecond = (value: CalendarDateTime) =>
  value.millisecond
    ? ownDateTime(value).set({ millisecond: 0 }).add({ seconds: 1 })
    : ownDateTime(value);

export function dayBounds(
  day: CalendarDate,
  min?: CalendarDateTime,
  max?: CalendarDateTime,
): { min?: Time; max?: Time } | null {
  const beforeMinDay = !!min && compareDays(day, dayOf(min)) < 0;
  const afterMaxDay = !!max && compareDays(day, dayOf(max)) > 0;
  if (beforeMinDay || afterMaxDay) return null;

  const lower = min && sameDay(day, dayOf(min)) ? ceilToWholeSecond(min) : undefined;
  const lowerLeavesTheDay = !!lower && !sameDay(dayOf(lower), day);
  const lowerPassesMax = !!lower && !!max && compareDateTimes(lower, max) > 0;
  if (lowerLeavesTheDay || lowerPassesMax) return null;

  const upper = max && sameDay(day, dayOf(max)) ? max : undefined;
  return { min: lower && timeOfDay(lower), max: upper && timeOfDay(upper) };
}

export function daySlots(day: CalendarDate, { min, max, precision, step }: DateTimeLimits) {
  const bounds = dayBounds(day, min, max);
  return bounds ? timeSlots(precision, step, bounds.min, bounds.max) : [];
}

export function dayUnavailable(day: CalendarDate, limits: DateTimeLimits): boolean {
  if (limits.disabled !== undefined && matchesAny(day, limits.disabled)) return true;

  const bounds = dayBounds(day, limits.min, limits.max);
  if (!bounds) return true;

  const canRunOutOfSlots = !!(bounds.min || bounds.max);
  return canRunOutOfSlots && daySlots(day, limits).length === 0;
}

export function onDay(day: CalendarDate, time: Time, limits: DateTimeLimits) {
  const seconds = nearestSlot(daySlots(day, limits), secondsOf(time));
  return seconds === undefined ? null : atSeconds(day, seconds);
}

export function withinLimits(value: CalendarDateTime, limits: DateTimeLimits): boolean {
  return (
    !dayUnavailable(dayOf(value), limits) &&
    (!limits.min || compareDateTimes(value, limits.min) >= 0) &&
    (!limits.max || compareDateTimes(value, limits.max) <= 0)
  );
}
