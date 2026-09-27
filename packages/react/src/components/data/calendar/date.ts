import { invariant } from '../../../utils';

export type DateRange = { start: Date | null; end: Date | null };
export type CalendarValue = Date | DateRange | Date[] | null;
export type CalendarSelectionMode = 'single' | 'range' | 'multiple' | 'none';
export type DateSelection =
  | {
      selectionMode?: 'single';
      value?: Date | null;
      defaultValue?: Date | null;
      onValueChange?: (value: Date | null) => void;
    }
  | {
      selectionMode: 'range';
      value?: DateRange | null;
      defaultValue?: DateRange | null;
      onValueChange?: (value: DateRange | null) => void;
    }
  | {
      selectionMode: 'multiple';
      value?: Date[];
      defaultValue?: Date[];
      onValueChange?: (value: Date[]) => void;
    };
export type DateLimits = {
  min?: Date;
  max?: Date;
  disabled?: boolean | ((date: Date) => boolean);
};

export function validDate(value: unknown): value is Date {
  return (
    value instanceof Date &&
    Number.isFinite(value.getTime()) &&
    value.getFullYear() >= 1 &&
    value.getFullYear() <= 9999
  );
}
// new Date(year, month, day) maps years 0..99 to 1900..1999, so the year is set separately.
export function dateAt(year: number, month: number, day: number): Date {
  const date = new Date(0);
  date.setFullYear(year, month, day);
  date.setHours(0, 0, 0, 0);
  return date;
}
export const dayOnly = (date: Date) => dateAt(date.getFullYear(), date.getMonth(), date.getDate());
export const startMonth = (date: Date) => dateAt(date.getFullYear(), date.getMonth(), 1);
export const dayKey = (date: Date) =>
  `${String(date.getFullYear()).padStart(4, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
export const sameDay = (a: Date | null | undefined, b: Date | null | undefined) =>
  !!a && !!b && dayKey(a) === dayKey(b);
export const sameMonth = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
// Adding days through the calendar date, not milliseconds, keeps DST days 1 day long.
export const addDays = (date: Date, count: number) =>
  dateAt(date.getFullYear(), date.getMonth(), date.getDate() + count);
// Jan 31 + 1 month is Feb 29 or 28, not Mar 2 or 3.
export function addMonths(date: Date, count: number): Date {
  const target = dateAt(date.getFullYear(), date.getMonth() + count, 1);
  const last = dateAt(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  return dateAt(target.getFullYear(), target.getMonth(), Math.min(date.getDate(), last));
}
export const lastOfMonth = (month: Date) => dateAt(month.getFullYear(), month.getMonth() + 1, 0);
export function clampDay(date: Date, min?: Date, max?: Date): Date {
  if (min && dayKey(date) < dayKey(min)) return dayOnly(min);
  if (max && dayKey(date) > dayKey(max)) return dayOnly(max);
  return dayOnly(date);
}
export function datesOf(value: CalendarValue): Date[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (value instanceof Date) return [value];
  return [value.start, value.end].filter((d): d is Date => d !== null);
}
export function emptyValue(mode: CalendarSelectionMode): CalendarValue {
  return mode === 'multiple' ? [] : null;
}
export function validateValue(value: CalendarValue, mode: CalendarSelectionMode) {
  if (mode === 'multiple')
    invariant(
      Array.isArray(value) && value.every(validDate),
      'Calendar: multiple requires Date[].',
    );
  else if (mode === 'range')
    invariant(
      value === null ||
        (!Array.isArray(value) &&
          !(value instanceof Date) &&
          typeof value === 'object' &&
          'start' in value &&
          'end' in value &&
          (value.start === null || validDate(value.start)) &&
          (value.end === null || validDate(value.end)) &&
          (!value.end || !!value.start) &&
          (!value.start || !value.end || dayKey(value.start) <= dayKey(value.end))),
      'Calendar: range requires ordered { start: Date | null, end: Date | null } | null.',
    );
  else
    invariant(
      value === null || validDate(value),
      'Calendar: single/none requires a valid Date | null.',
    );
}

export function isBlocked(date: Date, { min, max, disabled }: DateLimits) {
  return (
    !validDate(date) ||
    disabled === true ||
    (!!min && dayKey(date) < dayKey(min)) ||
    (!!max && dayKey(date) > dayKey(max)) ||
    (typeof disabled === 'function' && disabled(dayOnly(date)))
  );
}

// A click on the selected day of a multiple selection removes it, a range restarts once both
// ends are set, and an earlier second click becomes the start instead of producing start > end.
export function nextSelection(
  mode: CalendarSelectionMode,
  current: CalendarValue,
  date: Date,
): CalendarValue {
  const day = dayOnly(date);
  if (mode === 'multiple') {
    const selected = current as Date[];
    return selected.some((d) => sameDay(d, day))
      ? selected.filter((d) => !sameDay(d, day))
      : [...selected, day];
  }
  if (mode === 'range') {
    const range = current as DateRange | null;
    if (!range?.start || range.end) return { start: day, end: null };
    return dayKey(day) < dayKey(range.start)
      ? { start: day, end: dayOnly(range.start) }
      : { start: dayOnly(range.start), end: day };
  }
  return day;
}

// APG grid keys: arrows move a day or a week, Home/End the week, PageUp/PageDown a month and
// Shift+PageUp/PageDown a year. In a right-to-left grid the horizontal arrows swap.
export function keyTarget(
  date: Date,
  key: string,
  { shiftKey, weekStart, rtl }: { shiftKey: boolean; weekStart: number; rtl: boolean },
): Date | undefined {
  const offset = (date.getDay() - weekStart + 7) % 7;
  switch (key) {
    case 'ArrowLeft':
      return addDays(date, rtl ? 1 : -1);
    case 'ArrowRight':
      return addDays(date, rtl ? -1 : 1);
    case 'ArrowUp':
      return addDays(date, -7);
    case 'ArrowDown':
      return addDays(date, 7);
    case 'Home':
      return addDays(date, -offset);
    case 'End':
      return addDays(date, 6 - offset);
    case 'PageUp':
      return addMonths(date, shiftKey ? -12 : -1);
    case 'PageDown':
      return addMonths(date, shiftKey ? 12 : 1);
    default:
      return undefined;
  }
}

// Always six weeks, so the grid keeps its height while the month changes under the pointer.
export function monthWeeks(month: Date, weekStart: number): Date[][] {
  const first = addDays(month, -((month.getDay() - weekStart + 7) % 7));
  return Array.from({ length: 6 }, (_, week) =>
    Array.from({ length: 7 }, (_, day) => addDays(first, week * 7 + day)),
  );
}

// CLDR first-day territories, for engines without Intl.Locale week data (Firefox). Everything
// else starts on Monday.
const sundayFirst = new Set(
  'AG AS BD BR BS BT BW BZ CA CN CO DM DO ET GT GU HK HN ID IL IN JM JP KE KH KR LA MH MM MO MT MX MZ NI NP PA PE PH PK PR PT PY SA SG SV TH TT TW UM US VE VI WS YE ZA ZW'.split(
    ' ',
  ),
);
const saturdayFirst = new Set('AE AF BH DJ DZ EG IQ IR JO KW LY OM QA SD SY'.split(' '));

export function firstWeekday(locale: string): number {
  const info = new Intl.Locale(locale) as Intl.Locale & {
    weekInfo?: { firstDay: number };
    getWeekInfo?: () => { firstDay: number };
  };
  const firstDay = info.getWeekInfo?.().firstDay ?? info.weekInfo?.firstDay;
  if (firstDay !== undefined) return firstDay % 7;
  const region = info.maximize().region ?? '';
  return sundayFirst.has(region) ? 0 : saturdayFirst.has(region) ? 6 : 1;
}

const dateFormats = new Map<string, Intl.DateTimeFormat>();
const numberFormats = new Map<string, Intl.NumberFormat>();

// A calendar renders a few hundred labels per month; building a formatter for each is the
// slowest part of a render, so formatters are shared per locale and options.
export function dateFormat(locale: string, options: Intl.DateTimeFormatOptions) {
  const key = `${locale}|${JSON.stringify(options)}`;
  let format = dateFormats.get(key);
  if (!format) {
    format = new Intl.DateTimeFormat(locale, { calendar: 'gregory', ...options });
    dateFormats.set(key, format);
  }
  return format;
}
// Day numbers go through NumberFormat rather than { day: 'numeric' }, which adds 일 or 日.
export function numberFormat(locale: string) {
  let format = numberFormats.get(locale);
  if (!format) {
    format = new Intl.NumberFormat(locale, { useGrouping: false });
    numberFormats.set(locale, format);
  }
  return format;
}

export function weekdayNames(locale: string, weekStart: number) {
  const long = dateFormat(locale, { weekday: 'long' });
  // 2026-06-07 is a Sunday.
  const dates = Array.from({ length: 7 }, (_, index) => dateAt(2026, 5, 7 + weekStart + index));
  const short = dates.map((date) => dateFormat(locale, { weekday: 'short' }).format(date));
  // Arabic, Hebrew and Persian have no short weekday names, and the full ones overflow a day
  // column, so those locales fall back to the narrow form.
  const narrow = short.some((name) => Array.from(name).length > 4)
    ? dates.map((date) => dateFormat(locale, { weekday: 'narrow' }).format(date))
    : short;
  return dates.map((date, index) => ({ short: narrow[index], long: long.format(date) }));
}

export function monthNames(locale: string) {
  const long = dateFormat(locale, { month: 'long' });
  return Array.from({ length: 12 }, (_, month) => long.format(dateAt(2026, month, 1)));
}

// The year menu spans min..max, or a century either side of today, and always holds the year
// on screen even when a controlled month sits outside that span.
export function yearSpan(visible: Date, today: Date, min?: Date, max?: Date) {
  const from = Math.min(min?.getFullYear() ?? today.getFullYear() - 100, visible.getFullYear());
  const to = Math.max(max?.getFullYear() ?? today.getFullYear() + 100, visible.getFullYear());
  return Array.from(
    { length: Math.min(to, 9999) - Math.max(from, 1) + 1 },
    (_, index) => Math.max(from, 1) + index,
  );
}
