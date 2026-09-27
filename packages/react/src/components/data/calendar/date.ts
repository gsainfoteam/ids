import { formatISO, isAfter, isSameDay, isValid, startOfDay } from 'date-fns';
import { dateMatchModifiers, type Matcher } from 'react-day-picker';

import { invariant } from '../../../utils';

export type { Matcher } from 'react-day-picker';

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
  disabled?: Matcher | Matcher[];
};

export const validDate = (value: unknown): value is Date => value instanceof Date && isValid(value);

// The ISO local date, which is also what DayPicker writes into data-day.
export const dayKey = (date: Date) => formatISO(date, { representation: 'date' });

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
          (!value.start || !value.end || !isAfter(startOfDay(value.start), value.end))),
      'Calendar: range requires ordered { start: Date | null, end: Date | null } | null.',
    );
  else
    invariant(
      value === null || validDate(value),
      'Calendar: single/none requires a valid Date | null.',
    );
}

// DayPicker compares before/after by calendar day, so min and max both stay pickable.
export function limitMatchers({ min, max, disabled }: DateLimits): Matcher[] {
  return [
    ...(min ? [{ before: min }] : []),
    ...(max ? [{ after: max }] : []),
    ...(disabled === undefined || disabled === false
      ? []
      : Array.isArray(disabled)
        ? disabled
        : [disabled]),
  ];
}

export const isBlocked = (date: Date, limits: DateLimits) =>
  !validDate(date) || dateMatchModifiers(startOfDay(date), limitMatchers(limits));

// Still used by the time picker and the fields until their own formatting and parsing move onto
// date-fns. new Date(year, month, day) maps years 0..99 to 1900..1999, so the year is set apart.
export function dateAt(year: number, month: number, day: number): Date {
  const date = new Date(0);
  date.setFullYear(year, month, day);
  date.setHours(0, 0, 0, 0);
  return date;
}
export const dayOnly = (date: Date) => startOfDay(date);
export const sameDay = (a: Date | null | undefined, b: Date | null | undefined) =>
  !!a && !!b && isSameDay(a, b);

const dateFormats = new Map<string, Intl.DateTimeFormat>();

export function dateFormat(locale: string, options: Intl.DateTimeFormatOptions) {
  const key = `${locale}|${JSON.stringify(options)}`;
  let format = dateFormats.get(key);
  if (!format) {
    format = new Intl.DateTimeFormat(locale, { calendar: 'gregory', ...options });
    dateFormats.set(key, format);
  }
  return format;
}
