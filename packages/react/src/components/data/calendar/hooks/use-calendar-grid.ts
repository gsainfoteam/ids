'use client';

import { createContext, use, useLayoutEffect, useRef, useState } from 'react';

import { endOfYear, startOfYear, type CalendarDate } from '@internationalized/date';
import { mapValues } from 'es-toolkit';

import { useControllableState } from '../../../../hooks/use-controllable-state';
import {
  compareDays,
  datesOf,
  emptyValue,
  firstOfMonth,
  isCalendarDate,
  limitMatchers,
  ownDate,
  sameDay,
  validateValue,
  type CalendarSelectionMode,
  type CalendarValue,
  type DateMatcher,
  type DateRange,
} from '../lib/date';
import {
  fromDayPickerRange,
  fromLocalDate,
  toDayPickerMatcher,
  toDayPickerRange,
  toLocalDate,
} from '../lib/day-picker-bridge';

import type { CalendarInstance } from './use-calendar';
import type { DateRange as DayPickerRange } from 'react-day-picker';

export type CalendarState = {
  value: CalendarValue;
  selectionMode: CalendarSelectionMode;
  month: CalendarDate;
  disabled: boolean;
  readOnly: boolean;
};

export type CalendarModifiers = Record<string, DateMatcher | DateMatcher[] | undefined>;

export const CalendarPickContext = createContext<((date: CalendarDate) => void) | null>(null);

export type CalendarGridOptions = {
  calendar: CalendarInstance;
  selectionMode: CalendarSelectionMode;
  value: CalendarValue | undefined;
  defaultValue: CalendarValue | undefined;
  onValueChange?: (value: CalendarValue) => void;
  disabled: boolean;
  readOnly: boolean;
  dropdown: boolean;
  dir?: 'ltr' | 'rtl';
};

const YEAR_MENU_REACH = 100;

function clampDay(date: CalendarDate, min?: CalendarDate, max?: CalendarDate) {
  if (min && compareDays(date, min) < 0) return min;
  if (max && compareDays(date, max) > 0) return max;
  return date;
}

export function useInternalCalendarGrid(options: CalendarGridOptions) {
  const { calendar, selectionMode, dropdown } = options;
  const { min, max, unavailable, today } = calendar;
  const [value, setValue] = useControllableState<CalendarValue>({
    value: options.value,
    defaultValue: options.defaultValue ?? emptyValue(selectionMode),
    onValueChange: options.onValueChange,
  });
  validateValue(value, selectionMode);

  const pick = use(CalendarPickContext);
  const { readOnly, disabled: allDisabled } = options;

  const [firstMonth] = useState(() => firstOfMonth(clampDay(datesOf(value)[0] ?? today, min, max)));
  const month = calendar.month ?? firstMonth;

  const menuStart = startOfYear(ownDate(today).subtract({ years: YEAR_MENU_REACH }));
  const menuEnd = endOfYear(ownDate(today).add({ years: YEAR_MENU_REACH }));
  const startMonth = min ?? (dropdown ? menuStart : undefined);
  const endMonth = max ?? (dropdown ? menuEnd : undefined);

  const change = (next: CalendarValue, day: CalendarDate) => {
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
          selected: toDayPickerRange(value as DateRange | null),
          onSelect: (range: DayPickerRange, day: Date) =>
            change(fromDayPickerRange(range), fromLocalDate(day)),
        }
      : selectionMode === 'multiple'
        ? {
            mode: 'multiple' as const,
            selected: (value as CalendarDate[]).map(toLocalDate),
            onSelect: (dates: Date[] | undefined, day: Date) =>
              change((dates ?? []).map(fromLocalDate), fromLocalDate(day)),
          }
        : {
            mode: 'single' as const,
            required: true as const,
            selected: isCalendarDate(value) ? toLocalDate(value) : undefined,
            onSelect: (_: Date, day: Date) => {
              const picked = fromLocalDate(day);
              change(isCalendarDate(value) && sameDay(value, picked) ? value : picked, picked);
            },
          };

  const [hovered, setHovered] = useState<CalendarDate | null>(null);
  const [focused, setFocused] = useState<CalendarDate | null>(null);
  const range = selectionMode === 'range' ? (value as DateRange | null) : null;
  const previewEnd = range?.start && !range.end && !readOnly ? (hovered ?? focused) : null;
  const preview =
    range?.start && previewEnd && !sameDay(range.start, previewEnd)
      ? compareDays(previewEnd, range.start) < 0
        ? { from: toLocalDate(previewEnd), to: toLocalDate(range.start) }
        : { from: toLocalDate(range.start), to: toLocalDate(previewEnd) }
      : undefined;
  const letPreviewFollowFocus = () => setHovered(null);

  const modifiers = (own: CalendarModifiers = {}) => ({
    ...mapValues(own, (matchers) =>
      matchers === undefined ? false : toDayPickerMatcher(matchers),
    ),
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
    today: toLocalDate(today),
    month: toLocalDate(month),
    setMonth: (next: Date) => calendar.setMonth(fromLocalDate(next)),
    startMonth: startMonth && toLocalDate(startMonth),
    endMonth: endMonth && toLocalDate(endMonth),
    disabled: toDayPickerMatcher(limitMatchers({ min, max, disabled: allDisabled || unavailable })),
    modifiers,
    onDayMouseEnter: (day: Date) => setHovered(fromLocalDate(day)),
    onGridMouseLeave: () => setHovered(null),
    onDayFocus: (day: Date) => setFocused(fromLocalDate(day)),
    onDayBlur: () => setFocused(null),
    onDayKeyDown: letPreviewFollowFocus,
  };
}

export type CalendarApi = ReturnType<typeof useInternalCalendarGrid>;
