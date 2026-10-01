import { CalendarDate, getDayOfWeek, isSameDay } from '@internationalized/date';
import { isFunction } from 'es-toolkit';

import { invariant } from '../../../utils';

export type DateRange = { start: CalendarDate | null; end: CalendarDate | null };
export type CalendarValue = CalendarDate | DateRange | CalendarDate[] | null;
export type CalendarSelectionMode = 'single' | 'range' | 'multiple' | 'none';

export type DateMatcher =
  | CalendarDate
  | CalendarDate[]
  | { start: CalendarDate; end: CalendarDate }
  | { before: CalendarDate }
  | { after: CalendarDate }
  | { after: CalendarDate; before: CalendarDate }
  | { dayOfWeek: number | number[] }
  | ((date: CalendarDate) => boolean)
  | boolean;

export type DateSelection =
  | {
      selectionMode?: 'single';
      value?: CalendarDate | null;
      defaultValue?: CalendarDate | null;
      onValueChange?: (value: CalendarDate | null) => void;
    }
  | {
      selectionMode: 'range';
      value?: DateRange | null;
      defaultValue?: DateRange | null;
      onValueChange?: (value: DateRange | null) => void;
    }
  | {
      selectionMode: 'multiple';
      value?: CalendarDate[];
      defaultValue?: CalendarDate[];
      onValueChange?: (value: CalendarDate[]) => void;
    };

export type DateLimits = {
  min?: CalendarDate;
  max?: CalendarDate;
  disabled?: DateMatcher | DateMatcher[];
};

const GREGORIAN = 'gregory';
const DATE_FIELDS = ['year', 'month', 'day'] as const;

type Shaped = Record<string, unknown> & { calendar?: { identifier?: unknown } };

export const isCalendarDate = (value: unknown): value is CalendarDate =>
  typeof value === 'object' &&
  value !== null &&
  DATE_FIELDS.every((field) => Number.isInteger((value as Shaped)[field])) &&
  typeof (value as Shaped).calendar?.identifier === 'string' &&
  isFunction((value as Shaped).compare) &&
  !('hour' in value);

export function validateDate(value: unknown, owner = 'Calendar') {
  if (value == null) return;

  invariant(
    isCalendarDate(value),
    `${owner}: expected a CalendarDate from @internationalized/date (new CalendarDate(2026, 9, 15)).`,
  );
  invariant(
    value.calendar.identifier === GREGORIAN,
    `${owner}: only gregorian dates are taken. Convert with toCalendar(date, new GregorianCalendar()).`,
  );
}

export const ownDate = (date: CalendarDate) => new CalendarDate(date.year, date.month, date.day);

export const compareDays = (a: CalendarDate, b: CalendarDate) => ownDate(a).compare(ownDate(b));

export const sameDay = (a: CalendarDate, b: CalendarDate) => isSameDay(ownDate(a), ownDate(b));

export const dayKey = (date: CalendarDate) => ownDate(date).toString();

const SUNDAY_FIRST = 'sun';
const ANY_LOCALE = 'en-US';

export const weekdayOf = (date: CalendarDate) =>
  getDayOfWeek(ownDate(date), ANY_LOCALE, SUNDAY_FIRST);

export function datesOf(value: CalendarValue): CalendarDate[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (isCalendarDate(value)) return [value];
  return [value.start, value.end].filter((date): date is CalendarDate => date !== null);
}

export function emptyValue(mode: CalendarSelectionMode): CalendarValue {
  return mode === 'multiple' ? [] : null;
}

const isRange = (value: CalendarValue): value is DateRange =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  !isCalendarDate(value) &&
  'start' in value &&
  'end' in value;

export function validateValue(value: CalendarValue, mode: CalendarSelectionMode) {
  if (mode === 'multiple') {
    invariant(Array.isArray(value), 'Calendar: multiple requires CalendarDate[].');
    value.forEach((date) => validateDate(date));
    return;
  }

  if (mode === 'range') {
    invariant(
      value === null || isRange(value),
      'Calendar: range requires { start: CalendarDate | null, end: CalendarDate | null } | null.',
    );
    if (value === null) return;

    validateDate(value.start);
    validateDate(value.end);
    const ordered =
      (!value.end || !!value.start) &&
      (!value.start || !value.end || compareDays(value.start, value.end) <= 0);
    invariant(ordered, 'Calendar: range requires start <= end, and no end without a start.');
    return;
  }

  validateDate(value);
}

function matchesOne(date: CalendarDate, matcher: DateMatcher): boolean {
  if (typeof matcher === 'boolean') return matcher;
  if (isFunction(matcher)) return matcher(date);
  if (Array.isArray(matcher)) return matcher.some((day) => sameDay(date, day));
  if (isCalendarDate(matcher)) return sameDay(date, matcher);

  if ('dayOfWeek' in matcher) {
    const days = Array.isArray(matcher.dayOfWeek) ? matcher.dayOfWeek : [matcher.dayOfWeek];
    return days.includes(weekdayOf(date));
  }

  if ('start' in matcher)
    return compareDays(date, matcher.start) >= 0 && compareDays(date, matcher.end) <= 0;

  const beforeHolds = !('before' in matcher) || compareDays(date, matcher.before) < 0;
  const afterHolds = !('after' in matcher) || compareDays(date, matcher.after) > 0;
  return beforeHolds && afterHolds;
}

const listOf = (matchers: DateMatcher | DateMatcher[]): DateMatcher[] =>
  Array.isArray(matchers) ? matchers : [matchers];

export const matchesAny = (date: CalendarDate, matchers: DateMatcher | DateMatcher[]) =>
  listOf(matchers).some((matcher) => matchesOne(date, matcher));

export function limitMatchers({ min, max, disabled }: DateLimits): DateMatcher[] {
  return [
    ...(min ? [{ before: min }] : []),
    ...(max ? [{ after: max }] : []),
    ...(disabled === undefined || disabled === false ? [] : listOf(disabled)),
  ];
}

export const isBlocked = (date: CalendarDate, limits: DateLimits) =>
  !isCalendarDate(date) || matchesAny(date, limitMatchers(limits));
