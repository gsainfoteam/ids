import { createContext, use, useLayoutEffect, useRef, useState } from 'react';

import {
  addYears,
  clamp,
  endOfYear,
  isBefore,
  isSameDay,
  startOfMonth,
  startOfYear,
} from 'date-fns';
import { maxTime, minTime } from 'date-fns/constants';

import {
  datesOf,
  emptyValue,
  limitMatchers,
  validDate,
  validateValue,
  type CalendarSelectionMode,
  type CalendarValue,
  type DateLimits,
  type DateRange,
  type Matcher,
} from './date';
import { useControllableState } from '../../../hooks/use-controllable-state';
import { invariant } from '../../../utils';

import type { DateRange as DayPickerRange } from 'react-day-picker';

export type CalendarState = {
  value: CalendarValue;
  selectionMode: CalendarSelectionMode;
  month: Date;
  disabled: boolean;
  readOnly: boolean;
};

export const CalendarPickContext = createContext<((date: Date) => void) | null>(null);

export type UseCalendarOptions = DateLimits & {
  selectionMode: CalendarSelectionMode;
  value: CalendarValue | undefined;
  defaultValue: CalendarValue | undefined;
  onValueChange?: (value: CalendarValue) => void;
  readOnly: boolean;
  monthsToShow: number;
  weekStartsOn?: number;
  month?: Date;
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  today?: Date;
  dropdown: boolean;
  dir?: 'ltr' | 'rtl';
};

function validateOptions({
  min,
  max,
  monthsToShow,
  month,
  defaultMonth,
  today,
  weekStartsOn,
}: UseCalendarOptions) {
  invariant(
    (!min || validDate(min)) && (!max || validDate(max)) && (!min || !max || !isBefore(max, min)),
    'Calendar: min/max must be valid dates with min <= max.',
  );
  invariant(
    Number.isInteger(monthsToShow) && monthsToShow >= 1 && monthsToShow <= 12,
    'Calendar: monthsToShow must be 1..12.',
  );
  invariant(
    (!month || validDate(month)) &&
      (!defaultMonth || validDate(defaultMonth)) &&
      (!today || validDate(today)),
    'Calendar: month/defaultMonth/today must be valid dates.',
  );
  invariant(
    weekStartsOn === undefined ||
      (Number.isInteger(weekStartsOn) && weekStartsOn >= 0 && weekStartsOn <= 6),
    'Calendar: weekStartsOn must be 0..6.',
  );
}

const YEAR_MENU_REACH = 100;

const toDayPicker = (range: DateRange | null): DayPickerRange | undefined =>
  range?.start ? { from: range.start, to: range.end ?? undefined } : undefined;
const fromDayPicker = (range: DayPickerRange | undefined): DateRange | null =>
  range?.from ? { start: range.from, end: range.to ?? null } : null;

export function useCalendar(options: UseCalendarOptions) {
  validateOptions(options);
  const { selectionMode, min, max, disabled, dropdown } = options;
  const [value, setValue] = useControllableState<CalendarValue>({
    value: options.value,
    defaultValue: options.defaultValue ?? emptyValue(selectionMode),
    onValueChange: options.onValueChange,
  });
  validateValue(value, selectionMode);
  const pick = use(CalendarPickContext);
  const allDisabled = disabled === true;
  const readOnly = options.readOnly || selectionMode === 'none';

  const [mountedToday] = useState(() => new Date());
  const today = options.today ?? mountedToday;
  const [month, setMonth] = useControllableState<Date>({
    value: options.month && startOfMonth(options.month),
    defaultValue: startOfMonth(
      options.defaultMonth ??
        clamp(datesOf(value)[0] ?? today, { start: min ?? minTime, end: max ?? maxTime }),
    ),
    onValueChange: options.onMonthChange,
  });

  const startMonth = min ?? (dropdown ? startOfYear(addYears(today, -YEAR_MENU_REACH)) : undefined);
  const endMonth = max ?? (dropdown ? endOfYear(addYears(today, YEAR_MENU_REACH)) : undefined);

  const change = (next: CalendarValue, day: Date) => {
    if (readOnly || allDisabled) return;
    setValue(next);
    pick?.(day);
  };
  const selection =
    selectionMode === 'range'
      ? {
          mode: 'range' as const,
          required: true as const,
          resetOnSelect: true,
          selected: toDayPicker(value as DateRange | null),
          onSelect: (range: DayPickerRange, day: Date) => change(fromDayPicker(range), day),
        }
      : selectionMode === 'multiple'
        ? {
            mode: 'multiple' as const,
            selected: value as Date[],
            onSelect: (dates: Date[] | undefined, day: Date) => change(dates ?? [], day),
          }
        : {
            mode: 'single' as const,
            required: true as const,
            selected: (value as Date | null) ?? undefined,
            onSelect: (_: Date, day: Date) =>
              change(value instanceof Date && isSameDay(value, day) ? value : day, day),
          };

  const [hovered, setHovered] = useState<Date | null>(null);
  const [focused, setFocused] = useState<Date | null>(null);
  const range = selectionMode === 'range' ? (value as DateRange | null) : null;
  const previewEnd = range?.start && !range.end && !readOnly ? (hovered ?? focused) : null;
  const preview =
    range?.start && previewEnd && !isSameDay(range.start, previewEnd)
      ? isBefore(previewEnd, range.start)
        ? { from: previewEnd, to: range.start }
        : { from: range.start, to: previewEnd }
      : undefined;
  const letPreviewFollowFocus = () => setHovered(null);
  const modifiers = (own?: Record<string, Matcher | Matcher[] | undefined>) => ({
    ...own,
    ...(preview && {
      range_preview: preview,
      range_preview_start: preview.from,
      range_preview_end: preview.to,
    }),
  });

  const rootRef = useRef<HTMLDivElement>(null);
  const [inherited, setInherited] = useState<'rtl'>();
  useLayoutEffect(() => {
    const parent = rootRef.current?.parentElement;
    if (!parent) return;
    const direction =
      getComputedStyle(parent).direction || parent.closest('[dir]')?.getAttribute('dir');
    setInherited(direction === 'rtl' ? 'rtl' : undefined);
  }, []);

  const state: CalendarState = {
    value,
    selectionMode,
    month,
    disabled: allDisabled,
    readOnly,
  };

  return {
    state,
    rootRef,
    dir: options.dir ?? inherited,
    selection,
    setMonth,
    startMonth,
    endMonth,
    disabled: limitMatchers({ min, max, disabled }),
    modifiers,
    onDayMouseEnter: (day: Date) => setHovered(day),
    onGridMouseLeave: () => setHovered(null),
    onDayFocus: (day: Date) => setFocused(day),
    onDayBlur: () => setFocused(null),
    onDayKeyDown: letPreviewFollowFocus,
  };
}

export type CalendarApi = ReturnType<typeof useCalendar>;
