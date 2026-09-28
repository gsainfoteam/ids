import { CalendarDate } from '@internationalized/date';

import { matchesAny, type DateMatcher, type DateRange } from './date';

import type { DateRange as DayPickerRange } from 'react-day-picker';

export function toLocalDate(date: CalendarDate): Date {
  const local = new Date(0);
  local.setFullYear(date.year, date.month - 1, date.day);
  local.setHours(0, 0, 0, 0);
  return local;
}

export const fromLocalDate = (date: Date) =>
  new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());

export const toUtcDate = (date: CalendarDate) =>
  new CalendarDate(date.year, date.month, date.day).toDate('UTC');

export const toDayPickerMatcher =
  (matchers: DateMatcher | DateMatcher[]) =>
  (date: Date): boolean =>
    matchesAny(fromLocalDate(date), matchers);

export const toDayPickerRange = (range: DateRange | null): DayPickerRange | undefined =>
  range?.start
    ? { from: toLocalDate(range.start), to: range.end ? toLocalDate(range.end) : undefined }
    : undefined;

export const fromDayPickerRange = (range: DayPickerRange | undefined): DateRange | null =>
  range?.from
    ? { start: fromLocalDate(range.from), end: range.to ? fromLocalDate(range.to) : null }
    : null;
