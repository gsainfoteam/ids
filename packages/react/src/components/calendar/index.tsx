import {
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react';

import { invariant, mergeProps } from '../../utils';
import { useFieldSize } from '../field/context';
import { part } from '../field-popup';
import {
  addDays,
  addMonths,
  clampDay,
  dateAt,
  datesOf,
  dayKey,
  dayOnly,
  firstWeekday,
  sameDay,
  startMonth,
  validDate,
  validateValue,
  type CalendarValue,
  type DateRange,
  type DateSelection,
} from './date';

import type { IdsSize } from '../../tokens/types';
export type CalendarOptions = {
  min?: Date;
  max?: Date;
  disabled?: boolean | ((date: Date) => boolean);
  readOnly?: boolean;
  monthsToShow?: number;
  locale?: string;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  size?: IdsSize;
  month?: Date;
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  today?: Date;
  autoFocus?: boolean;
};
export type CalendarProps = Omit<
  ComponentProps<'div'>,
  'defaultValue' | 'onChange' | 'onSelect' | 'children'
> &
  CalendarOptions &
  (
    | DateSelection
    | { selectionMode: 'none'; value?: Date | null; defaultValue?: Date | null; onChange?: never }
  ) & { children?: ReactNode };
type BoxProps = ComponentProps<'div'> & { asChild?: boolean };
type ContextValue = {
  value: CalendarValue;
  mode: string;
  month: Date;
  today: Date;
  size: IdsSize;
  locale: string;
  weekStart: number;
  focus: Date;
  allDisabled: boolean;
  blocked: (date: Date) => boolean;
  readOnly: boolean;
  choose: (date: Date) => void;
  move: (date: Date, focus: boolean) => void;
  navigate: (amount: number) => void;
  canNavigate: (amount: number) => boolean;
  setFocus: (date: Date) => void;
  months: Date[];
};
const Context = createContext<ContextValue | null>(null),
  MonthContext = createContext<Date | null>(null),
  BodyContext = createContext(false);
function useCalendar() {
  const c = useContext(Context);
  invariant(c, 'Calendar parts must be inside Calendar.');
  return c;
}
function useMonth() {
  const c = useCalendar();
  return useContext(MonthContext) ?? c.month;
}
function CalendarHeader({ asChild, children, ...props }: BoxProps) {
  return part(
    'div',
    asChild,
    children,
    mergeProps({ className: 'mb-2 flex items-center justify-between gap-2' }, props),
  );
}
function CalendarNavigation({ asChild, children, ...props }: BoxProps) {
  const c = useCalendar(),
    month = useMonth();
  return part(
    'div',
    asChild,
    children ?? (
      <>
        <button
          type="button"
          aria-label="이전 달"
          disabled={!c.canNavigate(-1)}
          onClick={() => c.navigate(-1)}
          className="size-8 shrink-0 rounded-lg hover:bg-(--ids-color-primary)/10 focus-visible:outline-2 disabled:opacity-30"
        >
          ‹
        </button>
        <span aria-live="polite" className="flex-1 text-center font-medium">
          {new Intl.DateTimeFormat(c.locale, {
            year: 'numeric',
            month: 'long',
            calendar: 'gregory',
          }).format(month)}
        </span>
        <button
          type="button"
          aria-label="다음 달"
          disabled={!c.canNavigate(1)}
          onClick={() => c.navigate(1)}
          className="size-8 shrink-0 rounded-lg hover:bg-(--ids-color-primary)/10 focus-visible:outline-2 disabled:opacity-30"
        >
          ›
        </button>
      </>
    ),
    mergeProps({ className: 'flex w-full items-center gap-2' }, props),
  );
}
function CalendarHeaderRow({ asChild, children, ...props }: BoxProps) {
  const c = useCalendar();
  return part(
    'div',
    asChild,
    children ??
      Array.from({ length: 7 }, (_, index) => {
        const date = dateAt(2026, 5, 7 + c.weekStart + index);
        return (
          <div
            key={index}
            role="columnheader"
            aria-label={new Intl.DateTimeFormat(c.locale, { weekday: 'long' }).format(date)}
            className="py-2 text-center text-xs text-(--ids-color-on-muted)"
          >
            {new Intl.DateTimeFormat(c.locale, { weekday: 'short' }).format(date)}
          </div>
        );
      }),
    mergeProps({ role: 'row', className: 'grid grid-cols-7' }, props),
  );
}
export type CalendarCellState = {
  selected: boolean;
  today: boolean;
  disabled: boolean;
  outsideMonth: boolean;
  rangeStart: boolean;
  rangeEnd: boolean;
  rangeMiddle: boolean;
};
function CalendarCell({ date, children, ...props }: Calendar.CellProps) {
  const c = useCalendar(),
    month = useMonth();
  invariant(useContext(BodyContext), 'Calendar.Grid.Cell must be inside Calendar.Grid.Body.');
  invariant(validDate(date), 'Calendar.Grid.Cell requires a valid date.');
  const outsideMonth =
    date.getMonth() !== month.getMonth() || date.getFullYear() !== month.getFullYear();
  const duplicate =
    outsideMonth &&
    c.months.some(
      (m) => m.getFullYear() === date.getFullYear() && m.getMonth() === date.getMonth(),
    );
  if (duplicate) return <div role="gridcell" aria-hidden="true" />;
  const range = c.mode === 'range' ? (c.value as DateRange | null) : null;
  const rangeStart = sameDay(range?.start, date),
    rangeEnd = sameDay(range?.end, date),
    rangeMiddle =
      !!range?.start &&
      !!range.end &&
      dayKey(date) > dayKey(range.start) &&
      dayKey(date) < dayKey(range.end);
  const state = {
    selected: datesOf(c.value).some((d) => sameDay(d, date)) || rangeMiddle,
    today: sameDay(date, c.today),
    disabled: c.blocked(date) || !!props.disabled,
    outsideMonth,
    rangeStart,
    rangeEnd,
    rangeMiddle,
  };
  const focused = sameDay(date, c.focus);
  return (
    <div
      role="gridcell"
      aria-selected={state.selected}
      aria-disabled={state.disabled || undefined}
      data-range-middle={rangeMiddle ? '' : undefined}
      className="min-w-0 data-range-middle:bg-(--ids-color-primary)/10"
    >
      <button
        {...props}
        type="button"
        data-calendar-day={dayKey(date)}
        data-outside-month={outsideMonth ? '' : undefined}
        data-selected={state.selected ? '' : undefined}
        data-range-endpoint={rangeStart || rangeEnd ? '' : undefined}
        aria-label={
          props['aria-label'] ??
          new Intl.DateTimeFormat(c.locale, { dateStyle: 'full', calendar: 'gregory' }).format(date)
        }
        aria-current={state.today ? 'date' : undefined}
        aria-disabled={state.disabled || undefined}
        tabIndex={focused && !c.allDisabled ? 0 : -1}
        className={`flex w-full items-center justify-center rounded-lg text-sm outline-offset-1 hover:bg-(--ids-color-primary)/10 focus-visible:outline-2 focus-visible:outline-(--ids-color-primary) aria-disabled:opacity-30 data-outside-month:text-(--ids-color-on-muted) ${c.size === 'tiny' ? 'h-7' : 'h-9'} ${state.today ? 'inset-ring-1 inset-ring-(--ids-color-primary)' : ''} ${state.selected && !rangeMiddle ? 'bg-(--ids-color-primary) text-(--ids-color-on-primary) hover:bg-(--ids-color-primary)' : ''} ${props.className ?? ''}`}
        onFocus={(e) => {
          props.onFocus?.(e);
          if (!e.defaultPrevented) c.setFocus(dayOnly(date));
        }}
        onClick={(e) => {
          props.onClick?.(e);
          if (!e.defaultPrevented) c.choose(date);
        }}
        onKeyDown={(e) => {
          props.onKeyDown?.(e);
          if (e.defaultPrevented || c.allDisabled) return;
          let next: Date | undefined;
          const offset = (date.getDay() - c.weekStart + 7) % 7;
          switch (e.key) {
            case 'ArrowLeft':
              next = addDays(date, -1);
              break;
            case 'ArrowRight':
              next = addDays(date, 1);
              break;
            case 'ArrowUp':
              next = addDays(date, -7);
              break;
            case 'ArrowDown':
              next = addDays(date, 7);
              break;
            case 'Home':
              next = addDays(date, -offset);
              break;
            case 'End':
              next = addDays(date, 6 - offset);
              break;
            case 'PageUp':
              next = addMonths(date, e.shiftKey ? -12 : -1);
              break;
            case 'PageDown':
              next = addMonths(date, e.shiftKey ? 12 : 1);
              break;
          }
          if (next) {
            e.preventDefault();
            if (validDate(next)) c.move(next, true);
          }
        }}
      >
        {typeof children === 'function' ? children(state) : (children ?? date.getDate())}
      </button>
    </div>
  );
}
function CalendarBody({ asChild, children, ...props }: Calendar.BodyProps) {
  const c = useCalendar(),
    month = useMonth();
  const first = addDays(month, -((month.getDay() - c.weekStart + 7) % 7));
  const rows = Array.from({ length: 6 }, (_, week) => (
    <div key={week} role="row" className="grid grid-cols-7">
      {Array.from({ length: 7 }, (_, day) => {
        const date = addDays(first, week * 7 + day);
        return validDate(date) ? (
          <div key={day} role="presentation" className="contents">
            {typeof children === 'function' ? children(date) : <CalendarCell date={date} />}
          </div>
        ) : (
          <div key={day} role="gridcell" />
        );
      })}
    </div>
  ));
  return (
    <BodyContext.Provider value>
      {part(
        'div',
        asChild,
        asChild && isValidElement(children)
          ? cloneElement(children, {}, rows)
          : typeof children === 'function' || children === undefined
            ? rows
            : children,
        { ...props, role: 'rowgroup' },
      )}
    </BodyContext.Provider>
  );
}
function CalendarGrid({ asChild, children, monthIndex = 0, ...props }: Calendar.GridProps) {
  const c = useCalendar(),
    month = c.months[monthIndex];
  invariant(month, 'Calendar.Grid monthIndex must be within monthsToShow.');
  return (
    <MonthContext.Provider value={month}>
      {part(
        'div',
        asChild,
        children ?? (
          <>
            <CalendarHeaderRow />
            <CalendarBody />
          </>
        ),
        {
          ...props,
          role: 'grid',
          'aria-label':
            props['aria-label'] ??
            new Intl.DateTimeFormat(c.locale, {
              year: 'numeric',
              month: 'long',
              calendar: 'gregory',
            }).format(month),
          'aria-multiselectable': c.mode === 'multiple' || c.mode === 'range' || undefined,
        },
      )}
    </MonthContext.Provider>
  );
}
export function Calendar(props: CalendarProps) {
  const {
    selectionMode = 'single',
    value,
    defaultValue,
    onChange: _onChange,
    min,
    max,
    disabled,
    readOnly = false,
    monthsToShow = 1,
    locale = 'en-US',
    weekStartsOn,
    size,
    month,
    defaultMonth,
    onMonthChange,
    today: todayProp,
    autoFocus = false,
    children,
    className,
    ref: forwardedRef,
    ...native
  } = props;
  const [stored, setStored] = useState<CalendarValue>(
    defaultValue ?? (selectionMode === 'multiple' ? [] : null),
  );
  const current = value === undefined ? stored : value;
  validateValue(current, selectionMode);
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
      (!todayProp || validDate(todayProp)),
    'Calendar: month/defaultMonth/today must be valid dates.',
  );
  invariant(
    weekStartsOn === undefined ||
      (Number.isInteger(weekStartsOn) && weekStartsOn >= 0 && weekStartsOn <= 6),
    'Calendar: weekStartsOn must be 0..6.',
  );
  const [today] = useState(() => dayOnly(todayProp ?? new Date()));
  const effectiveToday = todayProp ?? today;
  const initial = clampDay(datesOf(current)[0] ?? effectiveToday, min, max);
  const [storedMonth, setStoredMonth] = useState(() => startMonth(defaultMonth ?? initial));
  const visibleMonth = startMonth(month ?? storedMonth);
  const months = Array.from({ length: monthsToShow }, (_, index) => addMonths(visibleMonth, index));
  invariant(months.every(validDate), 'Calendar: displayed months must stay in years 1..9999.');
  const [focused, setFocused] = useState(() => initial);
  const firstDay = visibleMonth,
    lastDay = dateAt(
      months[months.length - 1].getFullYear(),
      months[months.length - 1].getMonth() + 1,
      0,
    );
  const focus = clampDay(focused, firstDay, lastDay);
  const root = useRef<HTMLDivElement>(null),
    pendingFocus = useRef(autoFocus);
  const resolvedSize = useFieldSize(size) ?? 'standard';
  const weekStart = weekStartsOn ?? firstWeekday(locale);
  const blocked = (date: Date) =>
    !validDate(date) ||
    disabled === true ||
    (!!min && dayKey(date) < dayKey(min)) ||
    (!!max && dayKey(date) > dayKey(max)) ||
    (typeof disabled === 'function' && disabled(dayOnly(date)));
  const changeMonth = (next: Date) => {
    if (month === undefined) setStoredMonth(startMonth(next));
    if (!sameDay(startMonth(next), visibleMonth)) onMonthChange?.(startMonth(next));
  };
  const move = (next: Date, shouldFocus: boolean) => {
    const date = clampDay(next, min, max);
    pendingFocus.current = shouldFocus;
    setFocused(date);
    if (dayKey(date) < dayKey(firstDay)) changeMonth(date);
    else if (dayKey(date) > dayKey(lastDay))
      changeMonth(addMonths(startMonth(date), 1 - monthsToShow));
  };
  const canNavigate = (amount: number) => {
    const next = addMonths(visibleMonth, amount),
      end = dateAt(next.getFullYear(), next.getMonth() + monthsToShow, 0);
    return (
      disabled !== true &&
      validDate(next) &&
      validDate(end) &&
      (!min || dayKey(end) >= dayKey(min)) &&
      (!max || dayKey(next) <= dayKey(max))
    );
  };
  const navigate = (amount: number) => {
    if (!canNavigate(amount)) return;
    changeMonth(addMonths(visibleMonth, amount));
    setFocused(clampDay(addMonths(focus, amount), min, max));
  };
  useLayoutEffect(() => {
    if (pendingFocus.current) {
      pendingFocus.current = false;
      root.current
        ?.querySelector<HTMLButtonElement>(`[data-calendar-day="${dayKey(focus)}"]`)
        ?.focus({ preventScroll: true });
    }
  }, [focus, visibleMonth]);
  const choose = (date: Date) => {
    if (readOnly || selectionMode === 'none' || blocked(date)) return;
    const next = dayOnly(date);
    move(next, true);
    let result: CalendarValue;
    if (selectionMode === 'multiple') {
      const selected = current as Date[];
      result = selected.some((d) => sameDay(d, next))
        ? selected.filter((d) => !sameDay(d, next))
        : [...selected, next];
    } else if (selectionMode === 'range') {
      const range = current as DateRange | null;
      result =
        !range?.start || range.end
          ? { start: next, end: null }
          : dayKey(next) < dayKey(range.start)
            ? { start: next, end: dayOnly(range.start) }
            : { start: dayOnly(range.start), end: next };
    } else result = next;
    if (value === undefined) setStored(result);
    if (props.selectionMode === 'multiple') props.onChange?.(result as Date[]);
    else if (props.selectionMode === 'range') props.onChange?.(result as DateRange);
    else if (props.selectionMode !== 'none') props.onChange?.(result as Date);
  };
  return (
    <Context.Provider
      value={{
        value: current,
        mode: selectionMode,
        month: visibleMonth,
        today: effectiveToday,
        size: resolvedSize,
        locale,
        weekStart,
        focus,
        allDisabled: disabled === true,
        blocked,
        readOnly,
        choose,
        move,
        navigate,
        canNavigate,
        setFocus: setFocused,
        months,
      }}
    >
      <div
        {...native}
        ref={(node) => {
          root.current = node;
          if (typeof forwardedRef === 'function') return forwardedRef(node);
          if (forwardedRef) forwardedRef.current = node;
        }}
        data-calendar=""
        role={native.role ?? 'group'}
        aria-label={native['aria-label'] ?? '달력'}
        aria-disabled={disabled === true || undefined}
        className={`min-w-0 text-(--ids-color-on-surface) ${className ?? ''}`}
      >
        {children ?? (
          <>
            <CalendarHeader>
              <CalendarNavigation />
            </CalendarHeader>
            <div className="flex flex-wrap gap-4">
              {months.map((m, index) => (
                <div
                  key={dayKey(m)}
                  className={`min-w-0 flex-1 ${resolvedSize === 'tiny' ? 'min-w-48' : 'min-w-56'}`}
                >
                  {monthsToShow > 1 && (
                    <div className="pb-1 text-center text-sm font-medium">
                      {new Intl.DateTimeFormat(locale, {
                        year: 'numeric',
                        month: 'long',
                        calendar: 'gregory',
                      }).format(m)}
                    </div>
                  )}
                  <CalendarGrid monthIndex={index} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Context.Provider>
  );
}
export namespace Calendar {
  export type Props = CalendarProps;
  export type GridProps = BoxProps & { monthIndex?: number };
  export type BodyProps = Omit<BoxProps, 'children'> & {
    children?: ReactNode | ((date: Date) => ReactNode);
  };
  export type CellProps = Omit<ComponentProps<'button'>, 'children'> & {
    date: Date;
    children?: ReactNode | ((state: CalendarCellState) => ReactNode);
  };
  export const Header = CalendarHeader,
    Navigation = CalendarNavigation;
  export const Grid = Object.assign(CalendarGrid, {
    HeaderRow: CalendarHeaderRow,
    Body: CalendarBody,
    Cell: CalendarCell,
  });
}
export type { DateRange } from './date';
