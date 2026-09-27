import { dayKey, sameDay } from '../../data/calendar/date';
import {
  nearestSlot,
  secondsOf,
  timeKey,
  timeSlots,
  withTime,
  type TimePrecision,
} from '../../data/time-picker/time';

export type DateTimeLimits = {
  min?: Date;
  max?: Date;
  disabled?: boolean | ((date: Date) => boolean);
  precision: TimePrecision;
  step: number;
};

export const serializeDateTime = (date: Date, precision: TimePrecision) =>
  `${dayKey(date)}T${timeKey(date, precision)}`;

// The time limits that apply on one day: min only bites on its own day and max on its own, every
// day in between is open from midnight to midnight. A min with milliseconds rounds up to the next
// whole second, since no clock position is smaller. null means the day is outside min..max.
export function dayBounds(day: Date, min?: Date, max?: Date): { min?: Date; max?: Date } | null {
  const key = dayKey(day);
  if ((min && key < dayKey(min)) || (max && key > dayKey(max))) return null;
  const lower =
    min && sameDay(day, min) ? new Date(Math.ceil(min.getTime() / 1000) * 1000) : undefined;
  if (lower && (!sameDay(lower, day) || (max && lower > max))) return null;
  return { min: lower, max: max && sameDay(day, max) ? max : undefined };
}

export function daySlots(day: Date, { min, max, precision, step }: DateTimeLimits): number[] {
  const bounds = dayBounds(day, min, max);
  if (!bounds) return [];
  return timeSlots(day, precision, step, bounds.min, bounds.max).filter((seconds) => {
    const date = withTime(day, seconds)!;
    return (!min || date >= min) && (!max || date <= max);
  });
}

// Only the days holding min or max can run out of clock positions, so the full slot list is
// built for those two days alone; every other day in range is available as a whole.
export function dayUnavailable(day: Date, limits: DateTimeLimits): boolean {
  if (limits.disabled === true) return true;
  if (typeof limits.disabled === 'function' && limits.disabled(day)) return true;
  const bounds = dayBounds(day, limits.min, limits.max);
  if (!bounds) return true;
  return bounds.min || bounds.max ? daySlots(day, limits).length === 0 : false;
}

// Moving to another day keeps the clock time, or the nearest time that day allows.
export function onDay(day: Date, time: Date, limits: DateTimeLimits): Date | null {
  const seconds = nearestSlot(daySlots(day, limits), secondsOf(time));
  return seconds === undefined ? null : withTime(day, seconds);
}

export function withinLimits(date: Date, limits: DateTimeLimits): boolean {
  return (
    !dayUnavailable(date, limits) &&
    (!limits.min || date >= limits.min) &&
    (!limits.max || date <= limits.max)
  );
}
