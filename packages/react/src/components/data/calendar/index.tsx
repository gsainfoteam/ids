import { type ReactNode, type CSSProperties } from 'react';

import { DayPicker, type DayPickerProps, type Numerals } from 'react-day-picker';

import { Chevron } from './chevron';
import { CalendarContext, type NativeProps } from './context';
import {
  type CalendarSelectionMode,
  type CalendarValue,
  type DateMatcher as CalendarDateMatcher,
  type DateRange,
  type DateSelection,
} from './date';
import { CalendarDayButton } from './day-button';
import { dayPickerFormatters, dayPickerLabels } from './day-picker-locale';
import { Dropdown } from './dropdown';
import { MonthButton } from './month-button';
import { MonthGrid } from './month-grid';
import { Root } from './root';
import { calendarStyle } from './style';
import { useCalendar, type CalendarModifiers, type CalendarState } from './use-calendar';
import { resolveLocale, weekStartOf, type WeekDay } from '../../../internal/date-locale';
import { mergeRefs } from '../../../utils';
import { useFieldSize } from '../../form/field/context';

import type { IdsSize } from '../../../tokens/types';
import type { CalendarDate } from '@internationalized/date';

export type CalendarCaptionLayout = 'label' | 'dropdown';

export type CalendarDayState = {
  selected: boolean;
  today: boolean;
  outside: boolean;
  disabled: boolean;
  rangeStart: boolean;
  rangeMiddle: boolean;
  rangeEnd: boolean;
  modifiers: Record<string, boolean>;
};

export type CalendarOptions = {
  min?: CalendarDate;
  max?: CalendarDate;
  disabled?: CalendarDateMatcher | CalendarDateMatcher[];
  readOnly?: boolean;
  monthsToShow?: number;
  locale?: string;
  weekStartsOn?: WeekDay;
  captionLayout?: CalendarCaptionLayout;
  size?: IdsSize;
  month?: CalendarDate;
  defaultMonth?: CalendarDate;
  onMonthChange?: (month: CalendarDate) => void;
  today?: CalendarDate;
  autoFocus?: boolean;
  dir?: 'ltr' | 'rtl';
  showOutsideDays?: boolean;
  fixedWeeks?: boolean;
  showWeekNumber?: boolean;
  numerals?: Numerals;
  modifiers?: CalendarModifiers;
  modifiersClassNames?: Record<string, string>;
  renderDay?: (day: CalendarDate, state: CalendarDayState) => ReactNode;
  footer?: ReactNode;
};

type NoneSelection = {
  selectionMode: 'none';
  value?: CalendarDate | null;
  defaultValue?: CalendarDate | null;
  onValueChange?: never;
};

export type CalendarProps = NativeProps &
  CalendarOptions &
  (DateSelection | NoneSelection) & {
    className?: string | ((state: CalendarState) => string | undefined);
    style?: CSSProperties | ((state: CalendarState) => CSSProperties | undefined);
  };

const dayPickerParts = {
  Root,
  DayButton: CalendarDayButton,
  Chevron,
  Dropdown,
  MonthGrid,
  PreviousMonthButton: MonthButton,
  NextMonthButton: MonthButton,
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
    renderDay,
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
  const styles = calendarStyle({ size: resolvedSize });

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
        modifierNames: Object.keys(modifiers ?? {}),
        renderDay,
      }}
    >
      <DayPicker
        {...(api.selection as DayPickerProps)}
        lang={resolvedLocale}
        locale={{ code: resolvedLocale, labels: {} }}
        weekStartsOn={weekStartsOn ?? weekStartOf(resolvedLocale)}
        numberOfMonths={monthsToShow}
        month={api.month}
        onMonthChange={api.setMonth}
        startMonth={api.startMonth}
        endMonth={api.endMonth}
        disabled={api.disabled}
        disableNavigation={state.disabled}
        today={api.today}
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
        labels={dayPickerLabels(resolvedLocale, numerals)}
        formatters={dayPickerFormatters(resolvedLocale, numerals)}
        components={dayPickerParts}
        onDayMouseEnter={api.onDayMouseEnter}
        onDayFocus={api.onDayFocus}
        onDayBlur={api.onDayBlur}
        onDayKeyDown={api.onDayKeyDown}
      />
    </CalendarContext>
  );
}

export namespace Calendar {
  export type Props = CalendarProps;
  export type State = CalendarState;
  export type Range = DateRange;
  export type SelectionMode = CalendarSelectionMode;
  export type CaptionLayout = CalendarCaptionLayout;
  export type DateMatcher = CalendarDateMatcher;
  export type DayState = CalendarDayState;

  export const Style = calendarStyle;
}

export { CalendarPickContext } from './use-calendar';
export type { CalendarState } from './use-calendar';
export type { DateRange, CalendarSelectionMode, CalendarValue, DateMatcher } from './date';
