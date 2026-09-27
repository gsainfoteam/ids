import { ClockIcon } from '@heroicons/react/24/outline';

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
import { temporalFormatter } from '../../../internal/temporal-field/format';
import { TimePicker, type TimePickerVariant } from '../../data/time-picker';
import {
  timeKey,
  validateTime,
  type TimeFormat,
  type TimePrecision,
} from '../../data/time-picker/time';

export type TimeFieldProps = TemporalFieldProps<Date | null> & {
  precision?: TimePrecision;
  format?: string;
  hourCycle?: TimeFormat;
  step?: number;
  min?: Date;
  max?: Date;
  locale?: string;
  pickerVariant?: TimePickerVariant;
  referenceDate?: Date;
};

const sameInstant = (a: Date | null, b: Date | null) =>
  a === b || (!!a && !!b && a.getTime() === b.getTime());

export function TimeField({
  precision = 'minute',
  format,
  hourCycle,
  step = 1,
  min,
  max,
  locale = messages.locale,
  pickerVariant,
  referenceDate,
  ...props
}: TimeFieldProps) {
  validateTime(props.value);
  validateTime(props.defaultValue);
  // format="12h" / "24h" names the hour cycle for both the text and the picker; a pattern only
  // describes the text, so the picker then follows hourCycle or the locale.
  const cycle = hourCycle ?? (format === '12h' || format === '24h' ? format : undefined);
  const display = temporalFormatter(format, locale, precision, cycle, false);
  return (
    <TemporalField
      {...props}
      config={{
        kind: 'time',
        empty: null,
        isEmpty: (value) => value === null,
        isSame: sameInstant,
        display: (value) => display(value!),
        serialize: (value) => timeKey(value!, precision),
        messages: messages.timeField,
        icon: ClockIcon,
        initialFocusSelector: '[data-time-column]',
        picker: ({ value, change, size }) => (
          <TimePicker
            value={value}
            onValueChange={change}
            referenceDate={referenceDate}
            precision={precision}
            format={cycle}
            step={step}
            min={min}
            max={max}
            locale={locale}
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
