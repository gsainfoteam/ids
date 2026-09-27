import { CalendarDaysIcon } from '@heroicons/react/24/outline';

import { describeDates, isEmptyDates, sameDates, serializeDates } from './date-value';
import { dateFormatter, type DateFieldFormat } from './format';
import { messages } from '../../../internal/messages';
import {
  TemporalClear,
  TemporalContent,
  TemporalField,
  TemporalTrigger,
  TemporalValue,
  temporalFieldStyle,
  type ClearProps as SharedClearProps,
  type ContentProps as SharedContentProps,
  type TemporalFieldProps,
  type TemporalFieldState,
  type TriggerProps as SharedTriggerProps,
  type ValueProps as SharedValueProps,
} from '../../../internal/temporal-field';
import { Calendar, CalendarPickContext, type CalendarOptions } from '../../data/calendar';
import {
  emptyValue,
  validateValue,
  type CalendarValue,
  type DateSelection,
} from '../../data/calendar/date';
import { useFieldSize } from '../field/context';

export type DateFieldProps = Omit<
  TemporalFieldProps<CalendarValue>,
  'value' | 'defaultValue' | 'onValueChange' | 'disabled'
> &
  Omit<CalendarOptions, 'autoFocus' | 'size' | 'readOnly'> &
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
    locale = messages.locale,
    weekStartsOn,
    captionLayout,
    month,
    defaultMonth,
    onMonthChange,
    today,
    ...rest
  } = props;
  const empty = emptyValue(selectionMode);
  if (value !== undefined) validateValue(value, selectionMode);
  if (defaultValue !== undefined) validateValue(defaultValue, selectionMode);
  const formatDate = dateFormatter(format, locale);
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
        // Up to two months side by side plus the popup's padding and border; more months wrap.
        preferredWidth: cell * 7 * shown + 16 * (shown - 1) + 26,
        initialFocusSelector: '[data-calendar-day][tabindex="0"]',
        picker: ({ value: current, change, close, size }) => (
          // A single date closes the popup on every pick, including the day already chosen.
          <CalendarPickContext value={selectionMode === 'single' ? () => close(true) : null}>
            <Calendar
              {...({ selectionMode, value: current, onValueChange: change } as Calendar.Props)}
              min={min}
              max={max}
              disabled={disabled === true ? undefined : disabled}
              monthsToShow={monthsToShow}
              locale={locale}
              weekStartsOn={weekStartsOn}
              captionLayout={captionLayout}
              month={month}
              defaultMonth={defaultMonth}
              onMonthChange={onMonthChange}
              today={today}
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
  export const Trigger = TemporalTrigger;
  export const Value = TemporalValue;
  export const Clear = TemporalClear;
  export const Content = TemporalContent;
  export const Style = temporalFieldStyle;
}

export type { DateFieldFormat } from './format';
