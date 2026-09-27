import { useState } from 'react';

import { CalendarDaysIcon } from '@heroicons/react/24/outline';

import {
  dayBounds,
  dayUnavailable,
  onDay,
  serializeDateTime,
  withinLimits,
  type DateTimeLimits,
} from './date-time';
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
import { temporalFormatter } from '../../../internal/temporal-field/format';
import { invariant } from '../../../utils';
import { Calendar, type CalendarOptions } from '../../data/calendar';
import { dayOnly } from '../../data/calendar/date';
import { TimePicker, type TimePickerVariant } from '../../data/time-picker';
import { validateTime, type TimeFormat, type TimePrecision } from '../../data/time-picker/time';
import { useFieldSize } from '../field/context';

import type { IdsSize } from '../../../tokens/types';

export type DateTimeFieldProps = Omit<TemporalFieldProps<Date | null>, 'disabled'> &
  Omit<CalendarOptions, 'autoFocus' | 'size' | 'readOnly' | 'disabled'> & {
    disabled?: boolean | ((date: Date) => boolean);
    precision?: TimePrecision;
    format?: string;
    hourCycle?: TimeFormat;
    step?: number;
    pickerVariant?: TimePickerVariant;
  };

type PanelProps = Pick<
  DateTimeFieldProps,
  | 'monthsToShow'
  | 'locale'
  | 'weekStartsOn'
  | 'captionLayout'
  | 'month'
  | 'defaultMonth'
  | 'onMonthChange'
  | 'pickerVariant'
> & {
  value: Date | null;
  change: TemporalChange<Date | null>;
  size: IdsSize;
  today: Date;
  limits: DateTimeLimits;
  cycle: TimeFormat | undefined;
};

const sameInstant = (a: Date | null, b: Date | null) =>
  a === b || (!!a && !!b && a.getTime() === b.getTime());

// The calendar and the clock edit one Date: a day keeps the clock time and a time keeps the day.
function Panel({
  value,
  change,
  size,
  today,
  limits,
  cycle,
  pickerVariant,
  ...calendar
}: PanelProps) {
  const styles = temporalFieldStyle({ size });
  const base = value ?? dayOnly(today);
  const unavailable = dayUnavailable(base, limits);
  const bounds = dayBounds(base, limits.min, limits.max);
  return (
    <div className={styles.panel()}>
      <Calendar
        {...calendar}
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
          value={value}
          referenceDate={base}
          onValueChange={(next) => {
            if (next === null) change(null);
            else if (withinLimits(next, limits)) change(next);
          }}
          precision={limits.precision}
          format={cycle}
          step={limits.step}
          min={bounds?.min}
          max={bounds?.max}
          locale={calendar.locale}
          variant={pickerVariant}
          size={size}
          disabled={unavailable}
          // Beside the calendar the clock shows seven rows, close to the calendar height with a middle row.
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
  locale = messages.locale,
  pickerVariant,
  monthsToShow = 1,
  weekStartsOn,
  captionLayout,
  month,
  defaultMonth,
  onMonthChange,
  today,
  ...props
}: DateTimeFieldProps) {
  validateTime(props.value);
  validateTime(props.defaultValue);
  validateTime(min);
  validateTime(max);
  invariant(!min || !max || min <= max, 'DateTimeField: min must be <= max.');
  const [mountedToday] = useState(() => new Date());
  const anchor = today ?? mountedToday;
  const cycle = hourCycle ?? (format === '12h' || format === '24h' ? format : undefined);
  const display = temporalFormatter(format, locale, precision, cycle, true);
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
        // The calendar months, the gap, a 13rem clock column and the popup's own padding.
        preferredWidth: cell * 7 * monthsToShow + 16 * monthsToShow + 208 + 26,
        initialFocusSelector: '[data-calendar-day][tabindex="0"]',
        picker: ({ value, change, size }) => (
          <Panel
            value={value}
            change={change}
            size={size}
            today={anchor}
            limits={limits}
            cycle={cycle}
            pickerVariant={pickerVariant}
            monthsToShow={monthsToShow}
            locale={locale}
            weekStartsOn={weekStartsOn}
            captionLayout={captionLayout}
            month={month}
            defaultMonth={defaultMonth}
            onMonthChange={onMonthChange}
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
