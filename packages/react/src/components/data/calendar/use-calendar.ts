import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';

import {
  addMonths,
  clampDay,
  dateAt,
  datesOf,
  dayKey,
  dayOnly,
  emptyValue,
  firstWeekday,
  isBlocked,
  keyTarget,
  lastOfMonth,
  nextSelection,
  sameDay,
  sameMonth,
  startMonth,
  validDate,
  validateValue,
  type CalendarSelectionMode,
  type CalendarValue,
  type DateLimits,
  type DateRange,
} from './date';
import { useControllableState } from '../../../hooks/use-controllable-state';
import { invariant } from '../../../utils';

export type CalendarState = {
  value: CalendarValue;
  selectionMode: CalendarSelectionMode;
  month: Date;
  months: Date[];
  focusedDate: Date;
  disabled: boolean;
  readOnly: boolean;
};

export type CalendarCellState = {
  date: Date;
  selected: boolean;
  today: boolean;
  disabled: boolean;
  outsideMonth: boolean;
  rangeStart: boolean;
  rangeEnd: boolean;
  rangeMiddle: boolean;
  preview: boolean;
  focused: boolean;
};

export type CalendarBand = 'start' | 'middle' | 'end';

// A field that shows the calendar in a popup needs to hear about every pick, including a click
// on the day that is already selected, which is not a value change and so never reaches
// onValueChange. Only DateField provides this; a standalone Calendar ignores it.
export const CalendarPickContext = createContext<((date: Date) => void) | null>(null);

export type UseCalendarOptions = DateLimits & {
  selectionMode: CalendarSelectionMode;
  value: CalendarValue | undefined;
  defaultValue: CalendarValue | undefined;
  onValueChange?: (value: CalendarValue) => void;
  readOnly: boolean;
  monthsToShow: number;
  locale: string;
  weekStartsOn?: number;
  month?: Date;
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  today?: Date;
  autoFocus: boolean;
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
    (!min || validDate(min)) &&
      (!max || validDate(max)) &&
      (!min || !max || dayKey(min) <= dayKey(max)),
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

export function useCalendar(options: UseCalendarOptions) {
  validateOptions(options);
  const {
    selectionMode,
    min,
    max,
    disabled,
    readOnly,
    monthsToShow,
    locale,
    onMonthChange,
    autoFocus,
  } = options;
  const [value, setValue] = useControllableState<CalendarValue>({
    value: options.value,
    defaultValue: options.defaultValue ?? emptyValue(selectionMode),
    onValueChange: options.onValueChange,
  });
  validateValue(value, selectionMode);
  const pick = useContext(CalendarPickContext);

  // Today is read once so a calendar left open over midnight does not move under the user.
  const [mountedToday] = useState(() => dayOnly(new Date()));
  const today = options.today ? dayOnly(options.today) : mountedToday;
  const limits = { min, max, disabled };
  const initial = clampDay(datesOf(value)[0] ?? today, min, max);

  const [storedMonth, setStoredMonth] = useState(() => startMonth(options.defaultMonth ?? initial));
  const month = startMonth(options.month ?? storedMonth);
  const months = Array.from({ length: monthsToShow }, (_, index) => addMonths(month, index));
  invariant(months.every(validDate), 'Calendar: displayed months must stay in years 1..9999.');
  const lastDay = lastOfMonth(months[months.length - 1]);

  const [focusTarget, setFocusTarget] = useState(initial);
  const focusedDate = clampDay(focusTarget, month, lastDay);
  const [hovered, setHovered] = useState<Date | null>(null);
  const [gridFocused, setGridFocused] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const pendingFocus = useRef(autoFocus);
  const weekStart = options.weekStartsOn ?? firstWeekday(locale);
  const allDisabled = disabled === true;

  const changeMonth = (next: Date) => {
    const start = startMonth(next);
    if (sameMonth(start, month)) return;
    if (options.month === undefined) setStoredMonth(start);
    onMonthChange?.(start);
  };

  // Moving focus past the visible months brings the new day into view: backwards it becomes the
  // first month, forwards the last, so the months already on screen shift as little as possible.
  const moveFocus = (target: Date, focus: boolean) => {
    const date = clampDay(target, min, max);
    pendingFocus.current = focus;
    setFocusTarget(date);
    if (dayKey(date) < dayKey(month)) changeMonth(date);
    else if (dayKey(date) > dayKey(lastDay))
      changeMonth(addMonths(startMonth(date), 1 - monthsToShow));
  };

  useLayoutEffect(() => {
    if (!pendingFocus.current) return;
    pendingFocus.current = false;
    rootRef.current
      ?.querySelector<HTMLElement>(`[data-calendar-day="${dayKey(focusedDate)}"]`)
      ?.focus({ preventScroll: true });
  });

  const canNavigate = (amount: number) => {
    const start = addMonths(month, amount);
    const end = lastOfMonth(addMonths(start, monthsToShow - 1));
    return (
      !allDisabled &&
      validDate(start) &&
      validDate(end) &&
      (!min || dayKey(end) >= dayKey(min)) &&
      (!max || dayKey(start) <= dayKey(max))
    );
  };

  const navigate = (amount: number) => {
    if (!canNavigate(amount)) return;
    changeMonth(addMonths(month, amount));
    setFocusTarget(clampDay(addMonths(focusedDate, amount), min, max));
  };

  // A month picked in the caption of the n-th visible month puts that month n places in.
  const showMonth = (target: Date, index: number) => {
    if (allDisabled) return;
    let start = addMonths(startMonth(target), -index);
    if (min && dayKey(lastOfMonth(addMonths(start, monthsToShow - 1))) < dayKey(min))
      start = startMonth(min);
    if (max && dayKey(start) > dayKey(max)) start = addMonths(startMonth(max), 1 - monthsToShow);
    if (!validDate(start)) return;
    changeMonth(start);
    const day = dateAt(start.getFullYear(), start.getMonth() + index, focusedDate.getDate());
    setFocusTarget(
      clampDay(
        sameMonth(day, addMonths(start, index)) ? day : lastOfMonth(addMonths(start, index)),
        min,
        max,
      ),
    );
  };

  const select = (date: Date) => {
    if (readOnly || selectionMode === 'none' || isBlocked(date, limits)) return;
    moveFocus(date, true);
    const next = nextSelection(selectionMode, value, date);
    if (!(selectionMode === 'single' && sameDay(value as Date | null, next as Date)))
      setValue(next);
    setHovered(null);
    pick?.(dayOnly(date));
  };

  const onDayKeyDown = (event: KeyboardEvent<HTMLElement>, date: Date) => {
    if (event.defaultPrevented || allDisabled) return;
    const element = event.currentTarget;
    // The dir attribute is the fallback where computed direction is unavailable (jsdom).
    const direction =
      getComputedStyle(element).direction || element.closest('[dir]')?.getAttribute('dir');
    const rtl = direction === 'rtl';
    const target = keyTarget(date, event.key, { shiftKey: event.shiftKey, weekStart, rtl });
    if (!target) return;
    event.preventDefault();
    if (!validDate(target)) return;
    setHovered(null);
    moveFocus(target, true);
  };

  // An unfinished range previews its end at whatever the user touched last: the day under the
  // pointer, or the focused day once the keyboard moves.
  const range = selectionMode === 'range' ? (value as DateRange | null) : null;
  const previewTarget =
    range?.start && !range.end && !readOnly
      ? (hovered ?? (gridFocused ? focusedDate : null))
      : null;
  const [bandStart, bandEnd] = (() => {
    if (range?.start && range.end) return [range.start, range.end];
    if (range?.start && previewTarget)
      return dayKey(previewTarget) < dayKey(range.start)
        ? [previewTarget, range.start]
        : [range.start, previewTarget];
    return [null, null];
  })();
  const previewing = !!range?.start && !range.end && !!previewTarget;

  const selectedKeys = new Set(datesOf(value).map(dayKey));

  const dayState = (date: Date, visibleMonth: Date): CalendarCellState => {
    const key = dayKey(date);
    const inBand = !!bandStart && !!bandEnd && key >= dayKey(bandStart) && key <= dayKey(bandEnd);
    const rangeStart = sameDay(range?.start, date);
    const rangeEnd = sameDay(range?.end, date);
    const rangeMiddle =
      !!range?.start && !!range.end && key > dayKey(range.start) && key < dayKey(range.end);
    return {
      date,
      selected: selectedKeys.has(key) || rangeMiddle,
      today: sameDay(date, today),
      disabled: isBlocked(date, limits),
      outsideMonth: !sameMonth(date, visibleMonth),
      rangeStart,
      rangeEnd,
      rangeMiddle,
      preview: previewing && inBand && !rangeStart,
      focused: sameDay(date, focusedDate),
    };
  };

  const bandOf = (date: Date): CalendarBand | undefined => {
    if (!bandStart || !bandEnd || sameDay(bandStart, bandEnd)) return undefined;
    const key = dayKey(date);
    if (key === dayKey(bandStart)) return 'start';
    if (key === dayKey(bandEnd)) return 'end';
    return key > dayKey(bandStart) && key < dayKey(bandEnd) ? 'middle' : undefined;
  };

  const state: CalendarState = {
    value,
    selectionMode,
    month,
    months,
    focusedDate,
    disabled: allDisabled,
    readOnly: readOnly || selectionMode === 'none',
  };

  return {
    state,
    rootRef,
    today,
    weekStart,
    limits,
    dayState,
    bandOf,
    select,
    canNavigate,
    navigate,
    showMonth,
    onDayKeyDown,
    onDayFocus: (date: Date) => setFocusTarget(dayOnly(date)),
    onDayHover: (date: Date | null) => setHovered(date && dayOnly(date)),
    onGridFocusChange: setGridFocused,
  };
}

export type CalendarApi = ReturnType<typeof useCalendar>;
