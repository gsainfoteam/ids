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
import {
  DayPicker,
  type ChevronProps,
  type CustomComponents,
  type DayButtonProps as DayPickerDayButtonProps,
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
import { dayPickerFormatters, dayPickerLabels } from './day-picker-locale';
import { useCalendar, type CalendarState } from './use-calendar';
import { resolveLocale, weekStartOf, type WeekDay } from '../../../internal/date-locale';
import { messages } from '../../../internal/messages';
import { invariant, mergeEventHandlers, mergeRefs, tv } from '../../../utils';
import { IconButton } from '../../action/icon-button';
import { useFieldSize } from '../../form/field/context';

import type { IdsSize } from '../../../tokens/types';

export type CalendarCaptionLayout = 'label' | 'dropdown';

export type CalendarOptions = {
  min?: Date;
  max?: Date;
  disabled?: Matcher | Matcher[];
  readOnly?: boolean;
  monthsToShow?: number;
  locale?: string;
  weekStartsOn?: WeekDay;
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
  const resolvedLocale = resolveLocale(locale);
  const resolvedSize = useFieldSize(size) ?? 'standard';
  const styles = Calendar.Style({ size: resolvedSize });

  return (
    <CalendarContext
      value={{
        state,
        size: resolvedSize,
        styles,
        native,
        // eslint-disable-next-line react-hooks/refs
        rootRef: mergeRefs(api.rootRef, ref),
        onGridMouseLeave: api.onGridMouseLeave,
      }}
    >
      <DayPicker
        {...(api.selection as DayPickerProps)}
        lang={resolvedLocale}
        locale={{ code: resolvedLocale, labels: {} }}
        weekStartsOn={weekStartsOn ?? weekStartOf(resolvedLocale)}
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
        navLayout="around"
        fixedWeeks={fixedWeeks}
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
        labels={{ ...dayPickerLabels(resolvedLocale, numerals), ...labels }}
        formatters={{ ...dayPickerFormatters(resolvedLocale, numerals), ...formatters }}
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

function CalendarDayButton({ day, modifiers, className, ref, ...props }: Calendar.DayButtonProps) {
  const c = useCalendarContext('Calendar.DayButton');
  const own = useRef<HTMLButtonElement>(null);
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
  const keyInLatinDigits = dayKey(day.date);
  return (
    <button
      {...props}
      ref={mergeRefs(own, ref)}
      data-calendar-day={keyInLatinDigits}
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

  export const DayButton = CalendarDayButton;

  export const Style = tv({
    slots: {
      root: 'relative w-fit min-w-0 text-(--ids-color-on-surface)',
      months: 'flex flex-wrap gap-4',
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
      today: { true: { dayButton: 'font-semibold' } },
      outside: { true: { dayButton: 'text-(--ids-color-on-muted)' } },
      selected: {
        true: {
          dayButton:
            'bg-(--ids-color-primary) font-medium text-(--ids-color-on-primary) hover:bg-(--ids-color-primary)/90',
        },
      },
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
