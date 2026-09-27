import {
  Fragment,
  cloneElement,
  createContext,
  isValidElement,
  use,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from 'react';

import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

import {
  dateAt,
  dateFormat,
  dayKey,
  lastOfMonth,
  monthNames,
  monthWeeks,
  numberFormat,
  sameMonth,
  validDate,
  weekdayNames,
  yearSpan,
  type CalendarSelectionMode,
  type CalendarValue,
  type DateRange,
  type DateSelection,
} from './date';
import {
  useCalendar,
  type CalendarApi,
  type CalendarCellState,
  type CalendarState,
} from './use-calendar';
import { controlSurface } from '../../../internal/control-surface';
import { part } from '../../../internal/field-popup';
import { messages } from '../../../internal/messages';
import { invariant, mergeProps, mergeRefs, tv } from '../../../utils';
import { useFieldSize } from '../../form/field/context';

import type { IdsSize } from '../../../tokens/types';

export type CalendarCaptionLayout = 'label' | 'dropdown';

export type CalendarOptions = {
  min?: Date;
  max?: Date;
  disabled?: boolean | ((date: Date) => boolean);
  readOnly?: boolean;
  monthsToShow?: number;
  locale?: string;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  captionLayout?: CalendarCaptionLayout;
  size?: IdsSize;
  month?: Date;
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  today?: Date;
  autoFocus?: boolean;
};

type NoneSelection = {
  selectionMode: 'none';
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: never;
};

export type CalendarProps = Omit<
  ComponentProps<'div'>,
  'defaultValue' | 'onChange' | 'onSelect' | 'children' | 'className' | 'style'
> &
  CalendarOptions &
  (DateSelection | NoneSelection) & {
    className?: string | ((state: CalendarState) => string | undefined);
    style?: CSSProperties | ((state: CalendarState) => CSSProperties | undefined);
    children?: ReactNode;
  };

type BoxProps = ComponentProps<'div'> & { asChild?: boolean };

type ContextValue = CalendarApi & {
  locale: string;
  size: IdsSize;
  captionLayout: CalendarCaptionLayout;
  styles: ReturnType<typeof Calendar.Style>;
};

const CalendarContext = createContext<ContextValue | null>(null);
const MonthContext = createContext<{ month: Date; index: number } | null>(null);
const BodyContext = createContext(false);

function useCalendarContext(part: string) {
  const context = use(CalendarContext);
  invariant(context, `${part} must be inside Calendar.`);
  return context;
}

// Parts inside Calendar.Month describe that month. Outside one they describe the whole view,
// which is how a single header above several grids still gets both buttons and a range title.
function useMonth(c: ContextValue, monthIndex?: number) {
  const scoped = use(MonthContext);
  if (scoped) return { ...scoped, whole: false };
  const month = c.state.months[monthIndex ?? 0];
  invariant(month, 'Calendar: monthIndex must be within monthsToShow.');
  return { month, index: monthIndex ?? 0, whole: monthIndex === undefined };
}

// An asChild element without children of its own still gets the part's default content, so
// <Calendar.Title asChild><h2 /></Calendar.Title> reads the month.
function withDefault(asChild: boolean | undefined, children: ReactNode, fallback: ReactNode) {
  if (!asChild) return children ?? fallback;
  return isValidElement<{ children?: ReactNode }>(children) && children.props.children == null
    ? cloneElement(children, undefined, fallback)
    : children;
}

const monthLabel = (locale: string, month: Date) =>
  dateFormat(locale, { year: 'numeric', month: 'long' }).format(month);

function viewLabel(locale: string, months: Date[]) {
  const first = months[0];
  const last = months[months.length - 1];
  return months.length === 1
    ? monthLabel(locale, first)
    : dateFormat(locale, { year: 'numeric', month: 'long' }).formatRange(first, last);
}

export function Calendar(props: CalendarProps) {
  const {
    selectionMode = 'single',
    value,
    defaultValue,
    onValueChange,
    min,
    max,
    disabled,
    readOnly = false,
    monthsToShow = 1,
    locale = messages.locale,
    weekStartsOn,
    captionLayout = 'label',
    size,
    month,
    defaultMonth,
    onMonthChange,
    today,
    autoFocus = false,
    children,
    className,
    style,
    ref,
    ...native
  } = props;
  const api = useCalendar({
    selectionMode,
    value,
    defaultValue,
    onValueChange: onValueChange as ((value: CalendarValue) => void) | undefined,
    min,
    max,
    disabled,
    readOnly,
    monthsToShow,
    locale,
    weekStartsOn,
    month,
    defaultMonth,
    onMonthChange,
    today,
    autoFocus,
  });
  const { state } = api;
  const resolvedSize = useFieldSize(size) ?? 'standard';
  const styles = Calendar.Style({ size: resolvedSize });

  return (
    <CalendarContext.Provider value={{ ...api, locale, size: resolvedSize, captionLayout, styles }}>
      <div
        {...native}
        ref={mergeRefs(api.rootRef, ref)}
        role={native.role ?? 'group'}
        aria-label={native['aria-label'] ?? messages.calendar.label}
        aria-disabled={state.disabled || undefined}
        data-calendar=""
        data-size={resolvedSize}
        data-selection-mode={selectionMode}
        data-disabled={state.disabled ? '' : undefined}
        data-readonly={state.readOnly ? '' : undefined}
        className={styles.root({
          className: typeof className === 'function' ? className(state) : className,
        })}
        style={typeof style === 'function' ? style(state) : style}
      >
        {children ?? (
          <div className={styles.months()}>
            {state.months.map((_, index) => (
              <Calendar.Month key={index} index={index} />
            ))}
          </div>
        )}
        {/* Buttons and menus change the month without moving focus, so the change is read out here. */}
        <span aria-live="polite" className="sr-only">
          {viewLabel(locale, state.months)}
        </span>
      </div>
    </CalendarContext.Provider>
  );
}

function NavButton({
  direction,
  asChild,
  children,
  ...props
}: Calendar.NavButtonProps & { direction: -1 | 1 }) {
  const c = useCalendarContext(direction < 0 ? 'Calendar.Previous' : 'Calendar.Next');
  const enabled = c.canNavigate(direction);
  const Icon = direction < 0 ? ChevronLeftIcon : ChevronRightIcon;
  // aria-disabled rather than disabled: a button that disables itself under the pointer or the
  // keyboard would drop focus to the page.
  return part(
    'button',
    asChild,
    withDefault(asChild, children, <Icon aria-hidden="true" />),
    mergeProps(props, {
      type: 'button',
      'aria-label':
        props['aria-label'] ??
        (direction < 0 ? messages.calendar.previousMonth : messages.calendar.nextMonth),
      'aria-disabled': !enabled || undefined,
      'data-disabled': enabled ? undefined : '',
      'data-calendar-nav': direction < 0 ? 'previous' : 'next',
      className: c.styles.navButton(),
      onClick: () => {
        if (enabled) c.navigate(direction);
      },
    }),
  );
}

function Select({
  kind,
  className,
  ...props
}: Omit<ComponentProps<'select'>, 'value' | 'defaultValue' | 'children'> & {
  kind: 'month' | 'year';
}) {
  const c = useCalendarContext(kind === 'month' ? 'Calendar.MonthSelect' : 'Calendar.YearSelect');
  const { month, index } = useMonth(c);
  const { min, max } = c.limits;
  const names = monthNames(c.locale);
  const years = yearSpan(month, c.today, min, max);
  const yearFormat = dateFormat(c.locale, { year: 'numeric' });
  const options =
    kind === 'month'
      ? names.map((name, m) => {
          const start = dateAt(month.getFullYear(), m, 1);
          const outside =
            (!!min && dayKey(lastOfMonth(start)) < dayKey(min)) ||
            (!!max && dayKey(start) > dayKey(max));
          return { value: m, label: name, disabled: outside };
        })
      : years.map((year) => ({
          value: year,
          label: yearFormat.format(dateAt(year, 0, 1)),
          disabled: false,
        }));
  const current = kind === 'month' ? month.getMonth() : month.getFullYear();
  return (
    <span className={c.styles.dropdown({ className })} data-calendar-dropdown={kind}>
      <select
        aria-label={kind === 'month' ? messages.calendar.month : messages.calendar.year}
        disabled={c.state.disabled}
        {...props}
        data-field-input=""
        value={current}
        onChange={(event) => {
          props.onChange?.(event);
          const picked = Number(event.currentTarget.value);
          c.showMonth(
            kind === 'month'
              ? dateAt(month.getFullYear(), picked, 1)
              : dateAt(picked, month.getMonth(), 1),
            index,
          );
        }}
        className={c.styles.dropdownSelect()}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      <span aria-hidden="true" className={c.styles.dropdownLabel()}>
        {options.find((option) => option.value === current)?.label}
        <ChevronDownIcon />
      </span>
    </span>
  );
}

function Cell({ date, className, style, children, ...props }: Calendar.CellProps) {
  const c = useCalendarContext('Calendar.Grid.Cell');
  const { month } = useMonth(c);
  invariant(use(BodyContext), 'Calendar.Grid.Cell must be inside Calendar.Grid.Body.');
  invariant(validDate(date), 'Calendar.Grid.Cell requires a valid date.');
  const state = c.dayState(date, month);
  // With several months on screen, a trailing or leading day that another grid shows in full
  // is left blank here so every date has exactly one focusable button.
  const shownElsewhere =
    state.outsideMonth && c.state.months.some((visible) => sameMonth(visible, date));
  if (shownElsewhere) return <div role="gridcell" aria-hidden="true" className={c.styles.cell()} />;
  const band = c.bandOf(date);
  const styles = Calendar.Style({
    size: c.size,
    band,
    selected: state.selected && !state.rangeMiddle,
    onBand: band !== undefined && !state.rangeStart && !state.rangeEnd,
    today: state.today,
    outside: state.outsideMonth,
    unavailable: state.disabled,
  });
  return (
    <div
      role="gridcell"
      aria-selected={state.selected}
      aria-disabled={state.disabled || undefined}
      data-band={band}
      className={styles.cell()}
    >
      <button
        {...props}
        type="button"
        data-calendar-day={dayKey(date)}
        data-selected={state.selected && !state.rangeMiddle ? '' : undefined}
        data-today={state.today ? '' : undefined}
        data-disabled={state.disabled ? '' : undefined}
        data-outside-month={state.outsideMonth ? '' : undefined}
        data-range-start={state.rangeStart ? '' : undefined}
        data-range-end={state.rangeEnd ? '' : undefined}
        data-range-middle={state.rangeMiddle ? '' : undefined}
        data-range-preview={state.preview ? '' : undefined}
        aria-label={props['aria-label'] ?? dateFormat(c.locale, { dateStyle: 'full' }).format(date)}
        aria-current={state.today ? 'date' : undefined}
        aria-disabled={state.disabled || undefined}
        tabIndex={state.focused && !c.state.disabled ? 0 : -1}
        className={styles.day({
          className: typeof className === 'function' ? className(state) : className,
        })}
        style={typeof style === 'function' ? style(state) : style}
        onFocus={(event) => {
          props.onFocus?.(event);
          if (!event.defaultPrevented) c.onDayFocus(date);
        }}
        onPointerEnter={(event) => {
          props.onPointerEnter?.(event);
          if (event.pointerType === 'mouse') c.onDayHover(date);
        }}
        onClick={(event) => {
          props.onClick?.(event);
          if (!event.defaultPrevented) c.select(date);
        }}
        onKeyDown={(event) => {
          props.onKeyDown?.(event);
          c.onDayKeyDown(event, date);
        }}
      >
        {typeof children === 'function'
          ? children(state)
          : (children ?? numberFormat(c.locale).format(date.getDate()))}
      </button>
    </div>
  );
}

export namespace Calendar {
  export type Props = CalendarProps;
  export type State = CalendarState;
  export type CellState = CalendarCellState;
  export type Range = DateRange;
  export type SelectionMode = CalendarSelectionMode;
  export type CaptionLayout = CalendarCaptionLayout;
  export type NavButtonProps = ComponentProps<'button'> & { asChild?: boolean };
  export type TitleProps = ComponentProps<'span'> & { asChild?: boolean };
  export type SelectProps = Omit<ComponentProps<'select'>, 'value' | 'defaultValue' | 'children'>;
  export type MonthProps = BoxProps & { index?: number };
  export type GridProps = BoxProps & { monthIndex?: number };
  export type BodyProps = Omit<BoxProps, 'children'> & {
    children?: ReactNode | ((date: Date) => ReactNode);
  };
  export type CellProps = Omit<ComponentProps<'button'>, 'children' | 'className' | 'style'> & {
    date: Date;
    className?: string | ((state: CellState) => string | undefined);
    style?: CSSProperties | ((state: CellState) => CSSProperties | undefined);
    children?: ReactNode | ((state: CellState) => ReactNode);
  };

  export function Month({ index = 0, asChild, children, ...props }: MonthProps) {
    const c = useCalendarContext('Calendar.Month');
    const month = c.state.months[index];
    invariant(month, 'Calendar.Month index must be within monthsToShow.');
    return (
      <MonthContext.Provider value={{ month, index }}>
        {part(
          'div',
          asChild,
          withDefault(
            asChild,
            children,
            <>
              <Header />
              <Grid />
            </>,
          ),
          mergeProps({ className: c.styles.month(), 'data-calendar-month': dayKey(month) }, props),
        )}
      </MonthContext.Provider>
    );
  }

  export function Header({ asChild, children, ...props }: BoxProps) {
    const c = useCalendarContext('Calendar.Header');
    return part(
      'div',
      asChild,
      withDefault(asChild, children, <Navigation />),
      mergeProps({ className: c.styles.header() }, props),
    );
  }

  // Previous sits on the first month and Next on the last, so several months share one pair.
  export function Navigation({ asChild, children, ...props }: BoxProps) {
    const c = useCalendarContext('Calendar.Navigation');
    const { index, whole } = useMonth(c);
    const first = whole || index === 0;
    const lastMonth = whole || index === c.state.months.length - 1;
    const spacer = <span aria-hidden="true" className={c.styles.navSpacer()} />;
    return part(
      'div',
      asChild,
      withDefault(
        asChild,
        children,
        <>
          {first ? <Previous /> : spacer}
          {c.captionLayout === 'dropdown' ? (
            <span className={c.styles.dropdowns()}>
              <MonthSelect />
              <YearSelect />
            </span>
          ) : (
            <Title />
          )}
          {lastMonth ? <Next /> : spacer}
        </>,
      ),
      mergeProps({ className: c.styles.navigation() }, props),
    );
  }

  export function Previous(props: NavButtonProps) {
    return <NavButton {...props} direction={-1} />;
  }

  export function Next(props: NavButtonProps) {
    return <NavButton {...props} direction={1} />;
  }

  export function Title({ asChild, children, ...props }: TitleProps) {
    const c = useCalendarContext('Calendar.Title');
    const { month, whole } = useMonth(c);
    return part(
      'span',
      asChild,
      withDefault(
        asChild,
        children,
        whole ? viewLabel(c.locale, c.state.months) : monthLabel(c.locale, month),
      ),
      mergeProps({ className: c.styles.title() }, props),
    );
  }

  export function MonthSelect(props: SelectProps) {
    return <Select {...props} kind="month" />;
  }

  export function YearSelect(props: SelectProps) {
    return <Select {...props} kind="year" />;
  }

  function GridRoot({ asChild, children, monthIndex, ...props }: GridProps) {
    const c = useCalendarContext('Calendar.Grid');
    const month = useMonth(c, monthIndex);
    return (
      <MonthContext.Provider value={month}>
        {part(
          'div',
          asChild,
          withDefault(
            asChild,
            children,
            <>
              <Grid.HeaderRow />
              <Grid.Body />
            </>,
          ),
          mergeProps(props, {
            role: 'grid',
            'aria-label': props['aria-label'] ?? monthLabel(c.locale, month.month),
            'aria-multiselectable':
              c.state.selectionMode === 'multiple' ||
              c.state.selectionMode === 'range' ||
              undefined,
            'aria-readonly': c.state.readOnly || undefined,
            'aria-disabled': c.state.disabled || undefined,
            'data-calendar-grid': dayKey(month.month),
            className: c.styles.grid(),
            onPointerLeave: () => c.onDayHover(null),
            onFocus: () => c.onGridFocusChange(true),
            onBlur: (event: React.FocusEvent<HTMLElement>) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null))
                c.onGridFocusChange(false);
            },
          }),
        )}
      </MonthContext.Provider>
    );
  }

  function HeaderRow({ asChild, children, ...props }: BoxProps) {
    const c = useCalendarContext('Calendar.Grid.HeaderRow');
    return part(
      'div',
      asChild,
      withDefault(
        asChild,
        children,
        weekdayNames(c.locale, c.weekStart).map((name) => (
          <div
            key={name.long}
            role="columnheader"
            aria-label={name.long}
            className={c.styles.weekday()}
          >
            {name.short}
          </div>
        )),
      ),
      mergeProps({ role: 'row', className: c.styles.headerRow() }, props),
    );
  }

  function Body({ asChild, children, ...props }: BodyProps) {
    const c = useCalendarContext('Calendar.Grid.Body');
    const { month } = useMonth(c);
    const rows = monthWeeks(month, c.weekStart).map((week, row) => (
      <div key={row} role="row" className={c.styles.row()}>
        {week.map((date, column) =>
          validDate(date) ? (
            <Fragment key={column}>
              {typeof children === 'function' ? children(date) : <Grid.Cell date={date} />}
            </Fragment>
          ) : (
            <div key={column} role="gridcell" aria-hidden="true" className={c.styles.cell()} />
          ),
        )}
      </div>
    ));
    return (
      <BodyContext.Provider value>
        {part(
          'div',
          asChild,
          typeof children === 'function' || children === undefined
            ? rows
            : withDefault(asChild, children, rows),
          mergeProps({ role: 'rowgroup', className: c.styles.body() }, props),
        )}
      </BodyContext.Provider>
    );
  }

  export const Grid = Object.assign(GridRoot, { HeaderRow, Body, Cell });

  export const Style = tv({
    slots: {
      root: 'relative w-fit min-w-0 text-(--ids-color-on-surface)',
      months: 'flex flex-wrap gap-4',
      month: 'flex flex-col gap-2',
      header: 'min-w-0',
      navigation: 'flex h-(--calendar-cell) items-center justify-between gap-1',
      navSpacer: 'size-(--calendar-cell) shrink-0',
      navButton: [
        controlSurface.base,
        'size-(--calendar-cell) rounded-standard bg-transparent p-0 text-(--ids-color-on-surface)',
        'hover:bg-(--ids-color-muted) data-disabled:hover:bg-transparent',
        '[&_svg]:size-(--ids-size-icon-standard) rtl:[&_svg]:-scale-x-100',
      ],
      title: 'min-w-0 flex-1 truncate text-center font-medium select-none',
      dropdowns: 'flex min-w-0 flex-1 items-center justify-center gap-1.5',
      dropdown: [
        'relative inline-flex min-w-0 items-center rounded-standard shadow-xs',
        'inset-ring-1 inset-ring-(--ids-color-border) focus-ring',
        'has-disabled:opacity-50',
      ],
      // The native select stays on top, transparent, so it opens the platform picker, while the
      // label under it keeps the calendar's type and a chevron.
      dropdownSelect:
        'peer absolute inset-0 size-full cursor-pointer appearance-none opacity-0 disabled:cursor-not-allowed',
      dropdownLabel: [
        'pointer-events-none flex h-(--calendar-dropdown) items-center gap-1 ps-2 pe-1 font-medium whitespace-nowrap',
        '[&_svg]:size-3.5 [&_svg]:text-(--ids-color-on-muted)',
      ],
      grid: 'flex flex-col',
      headerRow: 'flex',
      weekday: [
        'flex h-(--calendar-weekday) w-(--calendar-cell) items-center justify-center',
        'font-normal text-(--ids-color-on-muted) select-none',
      ],
      body: 'flex flex-col gap-y-1',
      row: 'flex',
      // The range band is the cell's own background. It runs under the rounded end days and
      // rounds off where a week wraps, so a range reads as one strip per week.
      cell: 'relative size-(--calendar-cell) shrink-0 p-0 first:rounded-s-standard last:rounded-e-standard',
      day: [
        'relative inline-flex size-full cursor-pointer items-center justify-center rounded-standard',
        'tabular-nums select-none focus-ring focus-visible:z-10',
        'transition-[color,background-color,box-shadow] duration-(--ids-motion-fast)',
        'motion-reduce:transition-none',
      ],
    },
    variants: {
      size: {
        standard: {
          root: [
            'text-body-b3-regular',
            '[--calendar-cell:var(--ids-size-control-standard)] [--calendar-dropdown:--spacing(8)] [--calendar-weekday:--spacing(8)]',
          ],
        },
        tiny: {
          root: [
            'text-caption-c1-regular',
            '[--calendar-cell:var(--ids-size-control-tiny)] [--calendar-dropdown:--spacing(7)] [--calendar-weekday:--spacing(7)]',
          ],
          navButton: '[&_svg]:size-(--ids-size-icon-tiny)',
        },
      } satisfies Record<IdsSize, object>,
      band: {
        start: { cell: 'rounded-s-standard bg-(--ids-color-muted)' },
        middle: { cell: 'bg-(--ids-color-muted)' },
        end: { cell: 'rounded-e-standard bg-(--ids-color-muted)' },
      },
      // Later variants win a conflict, so selected comes after today and outside.
      today: { true: { day: 'font-semibold' } },
      outside: { true: { day: 'text-(--ids-color-on-muted)' } },
      selected: {
        true: {
          day: 'bg-(--ids-color-primary) font-medium text-(--ids-color-on-primary) hover:bg-(--ids-color-primary)/90',
        },
      },
      // A day inside a range already sits on the muted band, so its hover goes one step darker.
      onBand: { true: { day: 'hover:bg-(--ids-color-border)' } },
      unavailable: { true: { day: 'cursor-not-allowed opacity-50' } },
    },
    compoundVariants: [
      { selected: false, onBand: false, today: true, class: { day: 'bg-(--ids-color-muted)' } },
      {
        selected: false,
        onBand: false,
        unavailable: false,
        class: { day: 'hover:bg-(--ids-color-muted)' },
      },
      { selected: true, unavailable: true, class: { day: 'hover:bg-(--ids-color-primary)' } },
      { onBand: true, unavailable: true, class: { day: 'hover:bg-transparent' } },
    ],
    defaultVariants: {
      size: 'standard',
      selected: false,
      onBand: false,
      today: false,
      outside: false,
      unavailable: false,
    },
  });
}

export { CalendarPickContext } from './use-calendar';
export type { CalendarCellState, CalendarState } from './use-calendar';
export type { DateRange, CalendarSelectionMode, CalendarValue } from './date';
