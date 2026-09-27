import {
  createContext,
  use,
  useEffect,
  useRef,
  type ComponentProps,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';

import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { omit } from 'es-toolkit';
import {
  DateLib,
  DayPicker,
  type ChevronProps,
  type CustomComponents,
  type DayButtonProps as DayPickerDayButtonProps,
  type DayPickerLocale,
  type DayPickerProps,
  type DropdownProps,
  type Formatters,
  type Labels,
  type Modifiers,
  type ModifiersClassNames,
  type MonthGridProps,
  type Numerals,
  type PreviousMonthButtonProps,
  type RootProps,
} from 'react-day-picker';

import {
  dayKey,
  type CalendarSelectionMode,
  type CalendarValue,
  type DateRange,
  type DateSelection,
  type Matcher,
} from './date';
import { useCalendar, type CalendarState } from './use-calendar';
import { resolveLocale, type DateLocale } from '../../../internal/date-locale';
import { messages } from '../../../internal/messages';
import { invariant, mergeEventHandlers, mergeRefs, tv } from '../../../utils';
import { IconButton } from '../../action/icon-button';
import { useFieldSize } from '../../form/field/context';

import type { IdsSize } from '../../../tokens/types';

export type CalendarCaptionLayout = 'label' | 'dropdown';

export type CalendarOptions = {
  min?: Date;
  max?: Date;
  // DayPicker matchers: true for the whole calendar, a function, dates, ranges or weekdays.
  disabled?: Matcher | Matcher[];
  readOnly?: boolean;
  monthsToShow?: number;
  locale?: DateLocale;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  captionLayout?: CalendarCaptionLayout;
  size?: IdsSize;
  month?: Date;
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  today?: Date;
  autoFocus?: boolean;
  dir?: 'ltr' | 'rtl';
  showOutsideDays?: boolean;
  fixedWeeks?: boolean;
  showWeekNumber?: boolean;
  numerals?: Numerals;
  modifiers?: Record<string, Matcher | Matcher[] | undefined>;
  modifiersClassNames?: ModifiersClassNames;
  components?: Partial<CustomComponents>;
  formatters?: Partial<Formatters>;
  labels?: Partial<Labels>;
  footer?: ReactNode;
};

type NoneSelection = {
  selectionMode: 'none';
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: never;
};

type NativeProps = Omit<
  ComponentProps<'div'>,
  'defaultValue' | 'onChange' | 'onSelect' | 'children' | 'className' | 'style' | 'dir'
>;

export type CalendarProps = NativeProps &
  CalendarOptions &
  (DateSelection | NoneSelection) & {
    className?: string | ((state: CalendarState) => string | undefined);
    style?: CSSProperties | ((state: CalendarState) => CSSProperties | undefined);
  };

type ContextValue = {
  state: CalendarState;
  size: IdsSize;
  styles: ReturnType<typeof Calendar.Style>;
  native: Omit<NativeProps, 'ref'>;
  rootRef: Ref<HTMLDivElement>;
  onGridMouseLeave: () => void;
};

const CalendarContext = createContext<ContextValue | null>(null);

function useCalendarContext(part: string) {
  const context = use(CalendarContext);
  invariant(context, `${part} must be inside Calendar.`);
  return context;
}

// Labels a locale from react-day-picker/locale translates stay translated; the rest follow the
// IDS messages, so the default calendar reads entirely in Korean.
const messageLabels: Partial<Labels> = {
  labelPrevious: () => messages.calendar.previousMonth,
  labelNext: () => messages.calendar.nextMonth,
  labelMonthDropdown: () => messages.calendar.month,
  labelYearDropdown: () => messages.calendar.year,
  labelWeekNumber: (week) => messages.calendar.weekNumber(week),
  labelWeekNumberHeader: () => messages.calendar.weekNumberHeader,
  labelDayButton: (date, modifiers, options, dateLib) =>
    [
      modifiers.today && messages.calendar.today,
      (dateLib ?? new DateLib(options)).format(date, 'PPPP'),
      modifiers.selected && messages.calendar.selected,
    ]
      .filter(Boolean)
      .join(', '),
};

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
    locale,
    weekStartsOn,
    captionLayout = 'label',
    size,
    month,
    defaultMonth,
    onMonthChange,
    today,
    autoFocus = false,
    dir,
    showOutsideDays,
    fixedWeeks = true,
    showWeekNumber,
    numerals,
    modifiers,
    modifiersClassNames,
    components,
    formatters,
    labels,
    footer,
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
    weekStartsOn,
    month,
    defaultMonth,
    onMonthChange,
    today,
    dropdown: captionLayout === 'dropdown',
    dir,
  });
  const { state } = api;
  const resolved: Partial<DayPickerLocale> = resolveLocale(locale);
  // DayPicker fills a locale without labels from its English one, which would name the grid
  // "2월 2024"; an empty set leaves the rest to DayPicker's locale-neutral defaults.
  const dateLocale = { ...resolved, labels: resolved.labels ?? {} };
  const resolvedSize = useFieldSize(size) ?? 'standard';
  const styles = Calendar.Style({ size: resolvedSize });

  return (
    <CalendarContext
      value={{
        state,
        size: resolvedSize,
        styles,
        native,
        // mergeRefs only builds a callback; no ref is read while rendering.
        // eslint-disable-next-line react-hooks/refs
        rootRef: mergeRefs(api.rootRef, ref),
        onGridMouseLeave: api.onGridMouseLeave,
      }}
    >
      <DayPicker
        {...(api.selection as DayPickerProps)}
        locale={dateLocale}
        weekStartsOn={weekStartsOn}
        numberOfMonths={monthsToShow}
        month={state.month}
        onMonthChange={api.setMonth}
        startMonth={api.startMonth}
        endMonth={api.endMonth}
        disabled={api.disabled}
        disableNavigation={state.disabled}
        today={today}
        autoFocus={autoFocus}
        captionLayout={captionLayout}
        // Previous and Next sit beside the caption, so Tab visits them in the order they are drawn.
        navLayout="around"
        fixedWeeks={fixedWeeks}
        // With several months the neighbours' days are already on screen in their own grid.
        showOutsideDays={showOutsideDays ?? monthsToShow === 1}
        showWeekNumber={showWeekNumber}
        numerals={numerals}
        dir={api.dir}
        footer={footer}
        modifiers={api.modifiers(modifiers)}
        modifiersClassNames={{
          range_preview: styles.rangeMiddle(),
          range_preview_start: styles.rangeStart(),
          range_preview_end: styles.rangeEnd(),
          ...modifiersClassNames,
        }}
        style={typeof style === 'function' ? style(state) : style}
        classNames={{
          root: styles.root({
            className: typeof className === 'function' ? className(state) : className,
          }),
          months: styles.months(),
          month: styles.month(),
          month_caption: styles.caption(),
          caption_label: styles.captionLabel(),
          dropdowns: styles.dropdowns(),
          button_previous: styles.previous(),
          button_next: styles.next(),
          chevron: styles.chevron(),
          month_grid: styles.grid(),
          weekdays: styles.weekdays(),
          weekday: styles.weekday(),
          week: styles.week(),
          week_number_header: styles.weekNumber(),
          week_number: styles.weekNumber(),
          day: styles.day(),
          range_start: styles.rangeStart(),
          range_middle: styles.rangeMiddle(),
          range_end: styles.rangeEnd(),
          hidden: styles.hidden(),
          footer: styles.footer(),
        }}
        labels={{
          ...omit(messageLabels, Object.keys(dateLocale.labels) as (keyof Labels)[]),
          ...labels,
        }}
        formatters={formatters}
        components={{
          Root,
          DayButton: CalendarDayButton,
          Chevron,
          Dropdown,
          MonthGrid,
          PreviousMonthButton: MonthButton,
          NextMonthButton: MonthButton,
          ...components,
        }}
        onDayMouseEnter={api.onDayMouseEnter}
        onDayFocus={api.onDayFocus}
        onDayBlur={api.onDayBlur}
        onDayKeyDown={api.onDayKeyDown}
      />
    </CalendarContext>
  );
}

function Root({ rootRef, ...props }: RootProps) {
  const c = useCalendarContext('Calendar');
  const { native, state } = c;
  return (
    <div
      {...props}
      {...native}
      ref={mergeRefs(rootRef, c.rootRef)}
      role={native.role ?? 'group'}
      aria-label={
        native['aria-label'] ?? (native['aria-labelledby'] ? undefined : messages.calendar.label)
      }
      aria-disabled={state.disabled || undefined}
      data-calendar=""
      data-size={c.size}
      data-selection-mode={state.selectionMode}
      data-disabled={state.disabled ? '' : undefined}
      data-readonly={state.readOnly ? '' : undefined}
    />
  );
}

function MonthGrid({ onMouseLeave, ...props }: MonthGridProps) {
  const c = useCalendarContext('Calendar');
  return (
    <table
      {...props}
      aria-readonly={c.state.readOnly || undefined}
      aria-disabled={c.state.disabled || undefined}
      onMouseLeave={mergeEventHandlers(onMouseLeave, c.onGridMouseLeave)}
    />
  );
}

const chevrons = {
  left: ChevronLeftIcon,
  right: ChevronRightIcon,
  up: ChevronUpIcon,
  down: ChevronDownIcon,
};

function Chevron({ orientation = 'left', className, style }: ChevronProps) {
  const Icon = chevrons[orientation];
  return <Icon aria-hidden="true" className={className} style={style} />;
}

// Previous and Next. DayPicker marks the button for a month out of reach with aria-disabled and
// tabIndex -1 instead of disabled, since a natively disabled button drops the focus of the press
// that just reached the last month; focusableWhenDisabled keeps it the same way. Its only child is
// DayPicker's Chevron.
function MonthButton({
  'aria-disabled': unavailable,
  children,
  ...props
}: PreviousMonthButtonProps) {
  const c = useCalendarContext('Calendar');
  return (
    <IconButton
      {...props}
      variant="ghost"
      size={c.size}
      disabled={unavailable === true || unavailable === 'true'}
      focusableWhenDisabled
      icon={children as ReactElement}
    />
  );
}

// DayPicker hands this a native select's props and change events, so it stays a select, not Select.
// The native select stays on top, transparent, so it opens the platform picker, while the label
// under it keeps the calendar's type and a chevron.
function Dropdown({ options, className, ...props }: DropdownProps) {
  const c = useCalendarContext('Calendar');
  const selected = options?.find((option) => option.value === props.value);
  return (
    <span data-disabled={props.disabled ? '' : undefined} className={c.styles.dropdownRoot()}>
      <select {...props} data-field-input="" className={c.styles.dropdown({ className })}>
        {options?.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      <span aria-hidden="true" className={c.styles.dropdownLabel()}>
        {selected?.label}
        <ChevronDownIcon />
      </span>
    </span>
  );
}

// A grid cell under DayPicker's roving focus, with aria-selected on its td, so it is not a Button.
function CalendarDayButton({ day, modifiers, className, ref, ...props }: Calendar.DayButtonProps) {
  const c = useCalendarContext('Calendar.DayButton');
  const own = useRef<HTMLButtonElement>(null);
  // DayPicker moves the keyboard by marking a day focused and leaves the focusing to the button.
  useEffect(() => {
    if (modifiers.focused) own.current?.focus();
  }, [modifiers.focused]);
  const preview = !!modifiers.range_preview && !modifiers.selected;
  const styles = Calendar.Style({
    size: c.size,
    selected: !!modifiers.selected && !modifiers.range_middle,
    onBand: !!modifiers.range_middle || preview,
    today: !!modifiers.today,
    outside: !!modifiers.outside,
    unavailable: !!modifiers.disabled,
  });
  const flag = (on: boolean | undefined) => (on ? '' : undefined);
  return (
    <button
      {...props}
      ref={mergeRefs(own, ref)}
      // DayPicker writes isoDate in the numeral system shown, so the key is formatted here.
      data-calendar-day={dayKey(day.date)}
      data-selected={flag(modifiers.selected)}
      data-today={flag(modifiers.today)}
      data-disabled={flag(modifiers.disabled)}
      data-outside={flag(modifiers.outside)}
      data-range-start={flag(modifiers.range_start)}
      data-range-middle={flag(modifiers.range_middle)}
      data-range-end={flag(modifiers.range_end)}
      data-range-preview={flag(preview)}
      className={styles.dayButton({ className })}
    />
  );
}

export namespace Calendar {
  export type Props = CalendarProps;
  export type State = CalendarState;
  export type Range = DateRange;
  export type SelectionMode = CalendarSelectionMode;
  export type CaptionLayout = CalendarCaptionLayout;
  export type DayModifiers = Modifiers;
  export type Components = Partial<CustomComponents>;
  export type DayButtonProps = DayPickerDayButtonProps & { ref?: Ref<HTMLButtonElement> };

  // The IDS day, for a components.DayButton that only changes what a day shows.
  export const DayButton = CalendarDayButton;

  export const Style = tv({
    slots: {
      root: 'relative w-fit min-w-0 text-(--ids-color-on-surface)',
      months: 'flex flex-wrap gap-4',
      // Previous and Next sit in the caption row of the first and last month. Every month keeps
      // both columns, so the captions line up whether or not a button stands beside them.
      month:
        'grid grid-cols-[var(--calendar-cell)_minmax(0,1fr)_var(--calendar-cell)] content-start gap-y-2',
      previous: 'col-start-1 row-start-1 size-(--calendar-cell)',
      next: 'col-start-3 row-start-1 size-(--calendar-cell)',
      chevron: 'size-(--calendar-icon)',
      caption:
        'col-start-2 row-start-1 flex h-(--calendar-cell) min-w-0 items-center justify-center',
      captionLabel: 'truncate font-medium select-none',
      dropdowns: 'flex min-w-0 items-center justify-center gap-1.5',
      dropdownRoot: [
        'relative inline-flex min-w-0 items-center rounded-standard shadow-xs',
        'inset-ring-1 inset-ring-(--ids-color-border) focus-ring',
        'data-disabled:opacity-50',
      ],
      dropdown:
        'absolute inset-0 size-full cursor-pointer appearance-none opacity-0 disabled:cursor-not-allowed',
      dropdownLabel: [
        'pointer-events-none flex h-(--calendar-dropdown) items-center gap-1 ps-2 pe-1 font-medium whitespace-nowrap',
        '[&_svg]:size-3.5 [&_svg]:text-(--ids-color-on-muted)',
      ],
      grid: 'col-span-3 row-start-2',
      // Rows are flex boxes, so a day cell sizes like any box and its corners can round.
      weekdays: 'flex',
      weekday: [
        'flex h-(--calendar-weekday) w-(--calendar-cell) items-center justify-center p-0',
        'font-normal text-(--ids-color-on-muted) select-none',
      ],
      week: 'flex not-first:mt-1',
      weekNumber: [
        'flex h-(--calendar-cell) w-(--calendar-cell) items-center justify-center p-0',
        'text-caption-c1-regular text-(--ids-color-on-muted) select-none',
      ],
      // The range band is the cell's own background. It runs under the rounded end days and
      // rounds off where a week wraps or a month ends beside hidden days, so a range reads as one
      // strip per week and month.
      day: [
        'relative size-(--calendar-cell) p-0 text-center',
        'first:rounded-s-standard last:rounded-e-standard',
        '[[data-hidden]+&]:rounded-s-standard [&:has(+[data-hidden])]:rounded-e-standard',
      ],
      rangeStart: 'rounded-s-standard bg-(--ids-color-muted)',
      rangeMiddle: 'bg-(--ids-color-muted)',
      rangeEnd: 'rounded-e-standard bg-(--ids-color-muted)',
      hidden: 'invisible',
      dayButton: [
        'relative inline-flex size-full cursor-pointer items-center justify-center rounded-standard',
        'tabular-nums select-none focus-ring focus-visible:z-10',
        'transition-[color,background-color,box-shadow] duration-(--ids-motion-fast)',
        'motion-reduce:transition-none',
      ],
      footer: 'mt-3 text-caption-c1-regular text-(--ids-color-on-muted)',
    },
    variants: {
      size: {
        standard: {
          root: [
            'text-body-b3-regular',
            '[--calendar-cell:var(--ids-size-control-standard)] [--calendar-dropdown:--spacing(8)] [--calendar-weekday:--spacing(8)]',
            '[--calendar-icon:var(--ids-size-icon-standard)]',
          ],
        },
        tiny: {
          root: [
            'text-caption-c1-regular',
            '[--calendar-cell:var(--ids-size-control-tiny)] [--calendar-dropdown:--spacing(7)] [--calendar-weekday:--spacing(7)]',
            '[--calendar-icon:var(--ids-size-icon-tiny)]',
          ],
        },
      } satisfies Record<IdsSize, object>,
      // Later variants win a conflict, so selected comes after today and outside.
      today: { true: { dayButton: 'font-semibold' } },
      outside: { true: { dayButton: 'text-(--ids-color-on-muted)' } },
      selected: {
        true: {
          dayButton:
            'bg-(--ids-color-primary) font-medium text-(--ids-color-on-primary) hover:bg-(--ids-color-primary)/90',
        },
      },
      // A day inside a range already sits on the muted band, so its hover goes one step darker.
      onBand: { true: { dayButton: 'hover:bg-(--ids-color-border)' } },
      unavailable: { true: { dayButton: 'cursor-not-allowed opacity-50' } },
    },
    compoundVariants: [
      {
        selected: false,
        onBand: false,
        today: true,
        class: { dayButton: 'bg-(--ids-color-muted)' },
      },
      {
        selected: false,
        onBand: false,
        unavailable: false,
        class: { dayButton: 'hover:bg-(--ids-color-muted)' },
      },
      { selected: true, unavailable: true, class: { dayButton: 'hover:bg-(--ids-color-primary)' } },
      { onBand: true, unavailable: true, class: { dayButton: 'hover:bg-transparent' } },
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
export type { CalendarState } from './use-calendar';
export type { DateRange, CalendarSelectionMode, CalendarValue, Matcher } from './date';
