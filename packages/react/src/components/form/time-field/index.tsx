import { ClockIcon } from '@heroicons/react/24/outline';

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
  type TemporalFieldProps,
  type TemporalFieldState,
  type TriggerProps as SharedTriggerProps,
  type ValueProps as SharedValueProps,
} from '../../../internal/temporal-field';
import {
  formatter,
  timeOptions,
  type TemporalFormat,
} from '../../../internal/temporal-field/format';
import { TimePicker, type TimePickerVariant } from '../../data/time-picker';
import {
  onUtcSampleDay,
  resolveHourCycle,
  sameTime,
  timeKey,
  validateTime,
  type HourCycle,
  type TimePrecision,
} from '../../data/time-picker/time';

import type { Time } from '@internationalized/date';

export type TimeFieldProps = TemporalFieldProps<Time | null> & {
  precision?: TimePrecision;
  format?: TemporalFormat<Time>;
  hourCycle?: HourCycle;
  step?: number;
  min?: Time;
  max?: Time;
  locale?: string;
  pickerVariant?: TimePickerVariant;
};

export function TimeField({
  precision = 'minute',
  format,
  hourCycle,
  step = 1,
  min,
  max,
  locale,
  pickerVariant,
  ...props
}: TimeFieldProps) {
  validateTime(props.value, 'TimeField');
  validateTime(props.defaultValue, 'TimeField');
  validateTime(min, 'TimeField');
  validateTime(max, 'TimeField');

  const dateLocale = resolveLocale(locale);
  const display = formatter(format, dateLocale, {
    defaults: timeOptions(precision),
    toDate: onUtcSampleDay,
    cycle: resolveHourCycle(hourCycle, dateLocale),
    timeZone: 'UTC',
  });

  return (
    <TemporalField
      {...props}
      config={{
        kind: 'time',
        empty: null,
        isEmpty: (value) => value === null,
        isSame: sameTime,
        display: (value) => display(value!),
        serialize: (value) => timeKey(value!, precision),
        messages: messages.timeField,
        icon: ClockIcon,
        initialFocusSelector: '[data-time-column]',
        picker: ({ value, change, size }) => (
          <TimePicker
            value={value}
            onValueChange={change}
            precision={precision}
            hourCycle={hourCycle}
            step={step}
            min={min}
            max={max}
            locale={dateLocale}
            variant={pickerVariant}
            size={size}
            className="w-full"
          />
        ),
      }}
    />
  );
}

export namespace TimeField {
  export type Props = TimeFieldProps;
  export type State = TemporalFieldState<Time | null>;
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
