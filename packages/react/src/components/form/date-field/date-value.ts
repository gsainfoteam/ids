import {
  datesOf,
  dayKey,
  isCalendarDate,
  sameDay,
  type CalendarSelectionMode,
  type CalendarValue,
  type DateRange,
} from '../../data/calendar/date';

import type { CalendarDate } from '@internationalized/date';

export const isEmptyDates = (value: CalendarValue) => datesOf(value).length === 0;

const sameOptionalDay = (a: CalendarDate | null | undefined, b: CalendarDate | null | undefined) =>
  a && b ? sameDay(a, b) : !a && !b;

export function sameDates(a: CalendarValue, b: CalendarValue): boolean {
  if (a === b) return true;

  if (Array.isArray(a) || Array.isArray(b))
    return (
      Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((date, index) => sameDay(date, b[index]))
    );

  if (isCalendarDate(a) || isCalendarDate(b))
    return isCalendarDate(a) && isCalendarDate(b) && sameDay(a, b);

  const rangeA = a as DateRange | null;
  const rangeB = b as DateRange | null;
  return sameOptionalDay(rangeA?.start, rangeB?.start) && sameOptionalDay(rangeA?.end, rangeB?.end);
}

export function describeDates(
  value: CalendarValue,
  mode: CalendarSelectionMode,
  format: (date: CalendarDate) => string,
): string {
  const dates = datesOf(value);

  if (mode === 'range') {
    const range = value as DateRange;
    return `${format(range.start!)} – ${range.end ? format(range.end) : '…'}`;
  }

  if (mode === 'multiple')
    return `${dates.slice(0, 2).map(format).join(', ')}${dates.length > 2 ? `, +${dates.length - 2}` : ''}`;

  return format(dates[0]);
}

export function serializeDates(value: CalendarValue, mode: CalendarSelectionMode) {
  if (mode === 'multiple') return datesOf(value).map(dayKey);

  if (mode === 'range') {
    const range = value as DateRange | null;
    return range?.start && range.end ? `${dayKey(range.start)}/${dayKey(range.end)}` : '';
  }

  return isCalendarDate(value) ? dayKey(value) : '';
}
