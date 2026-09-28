import { Time } from '@internationalized/date';
import {
  addMilliseconds,
  isAfter,
  isBefore,
  isSameDay,
  isValid,
  set,
  startOfDay,
  startOfSecond,
} from 'date-fns';
import { dateMatchModifiers, type Matcher } from 'react-day-picker';

import { invariant } from '../../../utils';
import { dayKey } from '../../data/calendar/date';
import { fromLocalDate } from '../../data/calendar/day-picker-bridge';
import {
  nearestSlot,
  secondsOf,
  timeKey,
  timeSlots,
  type TimePrecision,
} from '../../data/time-picker/time';

export type DateTimeMatcher = Matcher;

export type DateTimeLimits = {
  min?: Date;
  max?: Date;
  disabled?: DateTimeMatcher | DateTimeMatcher[];
  precision: TimePrecision;
  step: number;
};

const validDate = (value: unknown): value is Date => value instanceof Date && isValid(value);

export function validateDateTime(value: Date | null | undefined) {
  invariant(value == null || validDate(value), 'DateTimeField: expected a valid Date or null.');
}

const matcherList = (matchers: DateTimeMatcher | DateTimeMatcher[] | undefined) =>
  matchers === undefined || matchers === false
    ? []
    : Array.isArray(matchers)
      ? matchers
      : [matchers];

export const matchesDay = (day: Date, matchers: DateTimeMatcher | DateTimeMatcher[] | undefined) =>
  dateMatchModifiers(startOfDay(day), matcherList(matchers));

export const timeOf = (date: Date) =>
  new Time(date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());

export function withTime(day: Date, seconds: number): Date | null {
  const next = set(day, {
    hours: Math.floor(seconds / 3600),
    minutes: Math.floor(seconds / 60) % 60,
    seconds: seconds % 60,
    milliseconds: 0,
  });
  const timeExistsThatDay = isSameDay(next, day) && secondsOf(timeOf(next)) === seconds;
  return timeExistsThatDay ? next : null;
}

export const serializeDateTime = (date: Date, precision: TimePrecision) =>
  `${dayKey(fromLocalDate(date))}T${timeKey(timeOf(date), precision)}`;

const ceilToWholeSecond = (date: Date) => startOfSecond(addMilliseconds(date, 999));

export function dayBounds(day: Date, min?: Date, max?: Date): { min?: Date; max?: Date } | null {
  const start = startOfDay(day);
  if ((min && isBefore(start, startOfDay(min))) || (max && isAfter(start, max))) return null;
  const lower = min && isSameDay(day, min) ? ceilToWholeSecond(min) : undefined;
  if (lower && (!isSameDay(lower, day) || (max && isAfter(lower, max)))) return null;
  return { min: lower, max: max && isSameDay(day, max) ? max : undefined };
}

export function daySlots(day: Date, { min, max, precision, step }: DateTimeLimits): number[] {
  const bounds = dayBounds(day, min, max);
  if (!bounds) return [];
  const lower = bounds.min && timeOf(bounds.min);
  const upper = bounds.max && timeOf(bounds.max);
  return timeSlots(precision, step, lower, upper).filter((seconds) => {
    const date = withTime(day, seconds);
    return !!date && (!min || !isBefore(date, min)) && (!max || !isAfter(date, max));
  });
}

export function dayUnavailable(day: Date, limits: DateTimeLimits): boolean {
  if (!validDate(day) || matchesDay(day, limits.disabled)) return true;
  const bounds = dayBounds(day, limits.min, limits.max);
  if (!bounds) return true;
  const canRunOutOfSlots = !!(bounds.min || bounds.max);
  return canRunOutOfSlots ? daySlots(day, limits).length === 0 : false;
}

export function onDay(day: Date, time: Date, limits: DateTimeLimits): Date | null {
  const seconds = nearestSlot(daySlots(day, limits), secondsOf(timeOf(time)));
  return seconds === undefined ? null : withTime(day, seconds);
}

export function withinLimits(date: Date, limits: DateTimeLimits): boolean {
  return (
    !dayUnavailable(date, limits) &&
    (!limits.min || !isBefore(date, limits.min)) &&
    (!limits.max || !isAfter(date, limits.max))
  );
}
