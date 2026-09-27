import {
  datesOf,
  dayKey,
  type CalendarSelectionMode,
  type CalendarValue,
  type DateRange,
} from '../../data/calendar/date';

export const isEmptyDates = (value: CalendarValue) => datesOf(value).length === 0;

// Values compare by calendar day, so a new Date for the same day is not a change.
export function sameDates(a: CalendarValue, b: CalendarValue): boolean {
  if (a === b) return true;
  if (Array.isArray(a) || Array.isArray(b))
    return (
      Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((date, index) => dayKey(date) === dayKey(b[index]))
    );
  if (a instanceof Date || b instanceof Date)
    return a instanceof Date && b instanceof Date && dayKey(a) === dayKey(b);
  const key = (date: Date | null | undefined) => (date ? dayKey(date) : '');
  return key(a?.start) === key(b?.start) && key(a?.end) === key(b?.end);
}

export function describeDates(
  value: CalendarValue,
  mode: CalendarSelectionMode,
  format: (date: Date) => string,
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

// ISO 8601 local dates. A range is one start/end interval and only counts once both ends are
// picked, so a half-picked range is missing to FormData and to required.
export function serializeDates(value: CalendarValue, mode: CalendarSelectionMode) {
  if (mode === 'multiple') return datesOf(value).map(dayKey);
  if (mode === 'range') {
    const range = value as DateRange | null;
    return range?.start && range.end ? `${dayKey(range.start)}/${dayKey(range.end)}` : '';
  }
  return value instanceof Date ? dayKey(value) : '';
}
