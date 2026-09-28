import { useState } from 'react';

import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { isAfter, startOfDay } from 'date-fns';

import {
  dayBounds,
  dayUnavailable,
  onDay,
  serializeDateTime,
  timeOf,
  validateDateTime,
  withTime,
  withinLimits,
  type DateTimeLimits,
} from './date-time';
import { resolveLocale } from '../../../internal/date-locale';
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
  type TemporalChange,
  type TemporalFieldProps,
  type TemporalFieldState,
  type TriggerProps as SharedTriggerProps,
  type ValueProps as SharedValueProps,
} from '../../../internal/temporal-field';
import {
  asDate,
  dateOptions,
  formatter,
  timeOptions,
  type TemporalFormat,
} from '../../../internal/temporal-field/format';
import { invariant } from '../../../utils';
import { Calendar, type CalendarOptions } from '../../data/calendar';
import { TimePicker, type TimePickerVariant } from '../../data/time-picker';
import {
  resolveHourCycle,
  secondsOf,
  type HourCycle,
  type TimePrecision,
} from '../../data/time-picker/time';
import { useFieldSize } from '../field/context';

import type { IdsSize } from '../../../tokens/types';
import type { Time } from '@internationalized/date';

export type DateTimeFieldProps = Omit<TemporalFieldProps<Date | null>, 'disabled'> &
  Omit<CalendarOptions, 'autoFocus' | 'size' | 'readOnly' | 'dir'> & {
    precision?: TimePrecision;
    format?: TemporalFormat<Date>;
    hourCycle?: HourCycle;
    step?: number;
    pickerVariant?: TimePickerVariant;
  };

type CalendarPassThrough = Omit<
  CalendarOptions,
  'autoFocus' | 'size' | 'readOnly' | 'dir' | 'min' | 'max' | 'disabled' | 'today' | 'locale'
>;

type PanelProps = CalendarPassThrough & {
  value: Date | null;
  change: TemporalChange<Date | null>;
  size: IdsSize;
  today: Date;
  limits: DateTimeLimits;
  cycle: HourCycle | undefined;
  locale: string;
  pickerVariant?: TimePickerVariant;
};

const sameInstant = (a: Date | null, b: Date | null) =>
  a === b || (!!a && !!b && a.getTime() === b.getTime());

const MONTH_GAP = 16;
const CLOCK_COLUMN = 208;
const POPUP_PADDING_AND_BORDER = 26;

function Panel({
  value,
  change,
  size,
  today,
  limits,
  cycle,
  locale,
  pickerVariant,
  ...calendar
}: PanelProps) {
  const styles = temporalFieldStyle({ size });
  const base = value ?? startOfDay(today);
  const unavailable = dayUnavailable(base, limits);
  const bounds = dayBounds(base, limits.min, limits.max);

  const pickTime = (next: Time | null) => {
    if (next === null) return change(null);

    const date = withTime(base, secondsOf(next));
    if (date && withinLimits(date, limits)) change(date);
  };

  return (
    <div className={styles.panel()}>
      <Calendar
        {...calendar}
        locale={locale}
        value={value}
        onValueChange={(day) => {
          const next = day && onDay(day, base, limits);
          if (next) change(next);
        }}
        min={limits.min}
        max={limits.max}
        disabled={(day) => dayUnavailable(day, limits)}
        today={today}
        size={size}
      />
      <div className={styles.panelTime()}>
        <TimePicker
          value={value && timeOf(value)}
          onValueChange={pickTime}
          precision={limits.precision}
          hourCycle={cycle}
          step={limits.step}
          min={bounds?.min && timeOf(bounds.min)}
          max={bounds?.max && timeOf(bounds.max)}
          locale={locale}
          variant={pickerVariant}
          size={size}
          disabled={unavailable}
          className="w-full sm:[--time-picker-height:calc(var(--time-option)*7)]"
        />
        {unavailable && (
          <p className={styles.panelHint()}>{messages.dateTimeField.pickDateFirst}</p>
        )}
      </div>
    </div>
  );
}

export function DateTimeField({
  precision = 'minute',
  format,
  hourCycle,
  step = 1,
  min,
  max,
  disabled,
  locale,
  pickerVariant,
  monthsToShow = 1,
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
  ...props
}: DateTimeFieldProps) {
  validateDateTime(props.value);
  validateDateTime(props.defaultValue);
  validateDateTime(min);
  validateDateTime(max);
  invariant(!min || !max || !isAfter(min, max), 'DateTimeField: min must be <= max.');
  const [mountedToday] = useState(() => new Date());
  const anchor = today ?? mountedToday;
  const dateLocale = resolveLocale(locale);
  const display = formatter(format, dateLocale, {
    defaults: { ...dateOptions, ...timeOptions(precision) },
    toDate: asDate,
    cycle: resolveHourCycle(hourCycle, dateLocale),
  });
  const limits: DateTimeLimits = { min, max, disabled, precision, step };
  const cell = (useFieldSize(props.size) ?? 'standard') === 'tiny' ? 32 : 36;
  return (
    <TemporalField
      {...props}
      disabled={disabled === true}
      config={{
        kind: 'date-time',
        empty: null,
        isEmpty: (value) => value === null,
        isSame: sameInstant,
        display: (value) => display(value!),
        serialize: (value) => serializeDateTime(value!, precision),
        messages: messages.dateTimeField,
        icon: CalendarDaysIcon,
        preferredWidth:
          cell * 7 * monthsToShow +
          MONTH_GAP * monthsToShow +
          CLOCK_COLUMN +
          POPUP_PADDING_AND_BORDER,
        initialFocusSelector: '[data-calendar-day][tabindex="0"]',
        picker: ({ value, change, size }) => (
          <Panel
            value={value}
            change={change}
            size={size}
            today={anchor}
            limits={limits}
            cycle={hourCycle}
            locale={dateLocale}
            pickerVariant={pickerVariant}
            monthsToShow={monthsToShow}
            weekStartsOn={weekStartsOn}
            captionLayout={captionLayout}
            month={month}
            defaultMonth={defaultMonth}
            onMonthChange={onMonthChange}
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
          />
        ),
      }}
    />
  );
}

export namespace DateTimeField {
  export type Props = DateTimeFieldProps;
  export type State = TemporalFieldState<Date | null>;
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
