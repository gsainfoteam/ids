'use client';

import { isValidElement, type CSSProperties, type ReactElement, type ReactNode } from 'react';

import { DayPicker, type DayPickerProps } from 'react-day-picker';

import { CalendarCaption, type CalendarCaptionProps } from './caption';
import { Chevron } from './chevron';
import { CalendarContext, type NativeProps } from './context';
import {
  type CalendarValue,
  type DateMatcher as CalendarDateMatcher,
  type DateSelection,
} from './date';
import { CalendarDay, type CalendarDayProps } from './day';
import { CalendarDayButton } from './day-button';
import { dayPickerFormatters, dayPickerLabels } from './day-picker-locale';
import { Dropdown } from './dropdown';
import { CalendarFooter } from './footer';
import { MonthButton } from './month-button';
import { MonthGrid } from './month-grid';
import { Root } from './picker-root';
import { calendarStyle } from './style';
import { useCalendar, type CalendarState } from './use-calendar';
import { CalendarWeekNumber, type CalendarWeekNumberProps } from './week-number';
import { resolveLocale, weekStartOf } from '../../../internal/date-locale';
import { useIntlWords, useProviderLocale } from '../../../internal/translate';
import { elementTypeOf, flattenFragments, invariant, mergeRefs } from '../../../utils';
import { useFieldSize } from '../../form/field/context';

import type { AccessibleName } from '../../../internal/accessible-name';
import type { IdsSize } from '../../../tokens/types';
import type { CalendarDate } from '@internationalized/date';

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
  size?: IdsSize;
  month?: CalendarDate;
  defaultMonth?: CalendarDate;
  onMonthChange?: (month: CalendarDate) => void;
  today?: CalendarDate;
  autoFocus?: boolean;
  dir?: 'ltr' | 'rtl';
  children?: ReactNode;
};

export type CalendarProps = NativeProps &
  AccessibleName &
  CalendarOptions &
  DateSelection & {
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
  Footer: ({ children }: { children?: ReactNode }) => <>{children}</>,
};

const CALENDAR_PARTS = new Set<unknown>([
  CalendarDay,
  CalendarFooter,
  CalendarWeekNumber,
  CalendarCaption,
]);

function calendarParts(children: ReactNode) {
  const parts = flattenFragments(children);
  invariant(
    parts.every((child) => isValidElement(child) && CALENDAR_PARTS.has(elementTypeOf(child))),
    'Calendar: children must be Calendar.Day, Calendar.Caption, Calendar.WeekNumber or Calendar.Footer.',
  );

  const find = <P,>(type: unknown) =>
    parts.find((child) => elementTypeOf(child as ReactElement) === type) as
      ReactElement<P> | undefined;

  return {
    day: find<CalendarDayProps>(CalendarDay)?.props,
    caption: find<CalendarCaptionProps>(CalendarCaption)?.props,
    weekNumber: find<CalendarWeekNumberProps>(CalendarWeekNumber)?.props,
    footer: find(CalendarFooter),
  };
}

export function CalendarRoot(props: CalendarProps) {
  const providerLocale = useProviderLocale();
  const words = useIntlWords(providerLocale);
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
    size,
    month,
    defaultMonth,
    onMonthChange,
    today,
    autoFocus = false,
    dir,
    children,
    className,
    style,
    ref,
    ...native
  } = props;

  const { day, caption, weekNumber, footer } = calendarParts(children);
  const captionLayout = caption?.layout ?? 'label';
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
    month,
    defaultMonth,
    onMonthChange,
    today,
    dropdown: captionLayout === 'dropdown',
    dir,
  });
  const { state } = api;
  const locale = resolveLocale(providerLocale);
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
        day,
      }}
    >
      <DayPicker
        {...(api.selection as DayPickerProps)}
        lang={locale}
        locale={{ code: locale, labels: {} }}
        weekStartsOn={weekStartOf(locale)}
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
        fixedWeeks
        showOutsideDays={monthsToShow === 1}
        showWeekNumber={!!weekNumber}
        dir={api.dir}
        footer={footer}
        modifiers={api.modifiers(day?.modifiers)}
        modifiersClassNames={{
          range_preview: styles.previewMiddle(),
          range_preview_start: styles.previewStart(),
          range_preview_end: styles.previewEnd(),
        }}
        style={typeof style === 'function' ? style(state) : style}
        classNames={{
          root: styles.root({
            className: typeof className === 'function' ? className(state) : className,
          }),
          months: styles.months(),
          month: styles.month(),
          month_caption: styles.caption({ className: caption?.className }),
          caption_label: styles.captionLabel(),
          dropdowns: styles.dropdowns(),
          button_previous: styles.previous(),
          button_next: styles.next(),
          chevron: styles.chevron(),
          month_grid: styles.grid(),
          weekdays: styles.weekdays(),
          weekday: styles.weekday(),
          week: styles.week(),
          week_number_header: styles.weekNumber({ className: weekNumber?.className }),
          week_number: styles.weekNumber({ className: weekNumber?.className }),
          day: styles.day(),
          range_start: styles.rangeStart(),
          range_middle: styles.rangeMiddle(),
          range_end: styles.rangeEnd(),
          hidden: styles.hidden(),
        }}
        labels={dayPickerLabels(locale, words)}
        formatters={dayPickerFormatters(locale)}
        components={dayPickerParts}
        onDayMouseEnter={api.onDayMouseEnter}
        onDayFocus={api.onDayFocus}
        onDayBlur={api.onDayBlur}
        onDayKeyDown={api.onDayKeyDown}
      />
    </CalendarContext>
  );
}
