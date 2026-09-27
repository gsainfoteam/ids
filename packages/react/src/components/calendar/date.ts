import { invariant } from '../../utils';

export type DateRange = { start: Date | null; end: Date | null };
export type CalendarValue = Date | DateRange | Date[] | null;
export type DateSelection =
  | {
      selectionMode?: 'single';
      value?: Date | null;
      defaultValue?: Date | null;
      onChange?: (value: Date | null) => void;
    }
  | {
      selectionMode: 'range';
      value?: DateRange | null;
      defaultValue?: DateRange | null;
      onChange?: (value: DateRange | null) => void;
    }
  | {
      selectionMode: 'multiple';
      value?: Date[];
      defaultValue?: Date[];
      onChange?: (value: Date[]) => void;
    };
export function validDate(value: unknown): value is Date {
  return (
    value instanceof Date &&
    Number.isFinite(value.getTime()) &&
    value.getFullYear() >= 1 &&
    value.getFullYear() <= 9999
  );
}
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
export const addDays = (date: Date, count: number) =>
  dateAt(date.getFullYear(), date.getMonth(), date.getDate() + count);
export function addMonths(date: Date, count: number): Date {
  const target = dateAt(date.getFullYear(), date.getMonth() + count, 1);
  const last = dateAt(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  return dateAt(target.getFullYear(), target.getMonth(), Math.min(date.getDate(), last));
}
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
export function validateValue(value: CalendarValue, mode: string) {
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
export function firstWeekday(locale: string): number {
  // Use locale week data when available; older engines can set weekStartsOn explicitly.
  const info = new Intl.Locale(locale) as Intl.Locale & {
    weekInfo?: { firstDay: number };
    getWeekInfo?: () => { firstDay: number };
  };
  return (info.getWeekInfo?.().firstDay ?? info.weekInfo?.firstDay ?? 7) % 7;
}
