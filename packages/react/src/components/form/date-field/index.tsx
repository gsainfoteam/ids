import { CalendarDaysIcon } from '@heroicons/react/24/outline';

import { describeDates, isEmptyDates, sameDates, serializeDates } from './date-value';
import { dateInputHint, parseDateText } from './parse';
import { resolveLocale } from '../../../internal/date-locale';
import { messages } from '../../../internal/messages';
import {
  TemporalClear,
  TemporalContent,
  TemporalField,
  TemporalInput,
  TemporalTrigger,
  TemporalValue,
  temporalFieldStyle,
  type ClearProps as SharedClearProps,
  type ContentProps as SharedContentProps,
  type InputProps as SharedInputProps,
  type TemporalFieldProps,
  type TemporalFieldState,
  type TriggerProps as SharedTriggerProps,
  type ValueProps as SharedValueProps,
} from '../../../internal/temporal-field';
import { formatter, type TemporalFormat } from '../../../internal/temporal-field/format';
import { Calendar, CalendarPickContext, type CalendarOptions } from '../../data/calendar';
import {
  emptyValue,
  isBlocked,
  validateValue,
  type CalendarValue,
  type DateSelection,
} from '../../data/calendar/date';
import { useFieldSize } from '../field/context';

export type DateFieldFormat = TemporalFormat;

export type DateFieldProps = Omit<
  TemporalFieldProps<CalendarValue>,
  'value' | 'defaultValue' | 'onValueChange' | 'disabled'
> &
  Omit<CalendarOptions, 'autoFocus' | 'size' | 'readOnly' | 'dir'> &
  DateSelection & {
    format?: DateFieldFormat;
  };

export function DateField(props: DateFieldProps) {
  const {
    selectionMode = 'single',
    value,
    defaultValue,
    onValueChange,
    format,
    min,
    max,
    disabled,
    monthsToShow = 1,
    locale,
    weekStartsOn,
    captionLayout,
    month,
    defaultMonth,
    onMonthChange,
    today,
    showOutsideDays,
    fixedWeeks,
    showWeekNumber,
    numerals,
    modifiers,
    modifiersClassNames,
    components,
    formatters,
    labels,
    footer,
    ...rest
  } = props;
  const empty = emptyValue(selectionMode);
  if (value !== undefined) validateValue(value, selectionMode);
  if (defaultValue !== undefined) validateValue(defaultValue, selectionMode);
  const dateLocale = resolveLocale(locale);
  const formatDate = formatter(format ?? 'P', dateLocale);
  const cell = (useFieldSize(rest.size) ?? 'standard') === 'tiny' ? 32 : 36;
  const shown = Math.min(monthsToShow, 2);
  const range = selectionMode === 'range';
  return (
    <TemporalField<CalendarValue>
      {...rest}
      value={value}
      defaultValue={defaultValue ?? empty}
      onValueChange={onValueChange as ((value: CalendarValue) => void) | undefined}
      disabled={disabled === true}
      config={{
        kind: 'date',
        empty,
        isEmpty: isEmptyDates,
        isSame: sameDates,
        display: (next) => describeDates(next, selectionMode, formatDate),
        serialize: (next) => serializeDates(next, selectionMode),
        messages: range
          ? {
              ...messages.dateField,
              placeholder: messages.dateField.rangePlaceholder,
              title: messages.dateField.rangeTitle,
            }
          : messages.dateField,
        icon: CalendarDaysIcon,
        preferredWidth: cell * 7 * shown + 16 * (shown - 1) + 26,
        initialFocusSelector: '[data-calendar-day][tabindex="0"]',
        parse:
          selectionMode === 'single'
            ? (text) => {
                const date = parseDateText(
                  text,
                  dateLocale,
                  typeof format === 'string' ? format : undefined,
                );
                return date && !isBlocked(date, { min, max, disabled }) ? date : undefined;
              }
            : undefined,
        inputHint: typeof format === 'string' ? format : dateInputHint(dateLocale),
        picker: ({ value: current, change, close, size }) => (
          <CalendarPickContext value={selectionMode === 'single' ? () => close(true) : null}>
            <Calendar
              {...({ selectionMode, value: current, onValueChange: change } as Calendar.Props)}
              min={min}
              max={max}
              disabled={disabled === true ? undefined : disabled}
              monthsToShow={monthsToShow}
              locale={dateLocale}
              weekStartsOn={weekStartsOn}
              captionLayout={captionLayout}
              month={month}
              defaultMonth={defaultMonth}
              onMonthChange={onMonthChange}
              today={today}
              showOutsideDays={showOutsideDays}
              fixedWeeks={fixedWeeks}
              showWeekNumber={showWeekNumber}
              numerals={numerals}
              modifiers={modifiers}
              modifiersClassNames={modifiersClassNames}
              components={components}
              formatters={formatters}
              labels={labels}
              footer={footer}
              size={size}
            />
          </CalendarPickContext>
        ),
      }}
    />
  );
}

export namespace DateField {
  export type Props = DateFieldProps;
  export type State = TemporalFieldState<CalendarValue>;
  export type TriggerProps = SharedTriggerProps;
  export type ValueProps = SharedValueProps;
  export type ClearProps = SharedClearProps;
  export type ContentProps = SharedContentProps;
  export type InputProps = SharedInputProps;
  export const Trigger = TemporalTrigger;
  export const Input = TemporalInput;
  export const Value = TemporalValue;
  export const Clear = TemporalClear;
  export const Content = TemporalContent;
  export const Style = temporalFieldStyle;
}
