import {
  TemporalField,
  TemporalTrigger,
  TemporalValue,
  TemporalContent,
  TemporalClear,
  temporalFieldStyle,
  type TemporalFieldProps,
  type TriggerProps as SharedTriggerProps,
  type ValueProps as SharedValueProps,
  type ContentProps as SharedContentProps,
} from '../../../internal/temporal-field';
import { temporalFormatter } from '../../../internal/temporal-field/format';
import { TimePicker, type TimePickerOptions } from '../../data/time-picker';
import { timeKey, type TimeFormat } from '../../data/time-picker/time';
export type TimeFieldProps = TemporalFieldProps &
  Omit<TimePickerOptions, 'variant' | 'format'> & {
    format?: string;
    hourCycle?: TimeFormat;
    pickerVariant?: 'grid' | 'wheel';
  };
export function TimeField({
  precision = 'minute',
  format,
  hourCycle,
  step,
  min,
  max,
  locale = 'en-US',
  pickerVariant,
  selectionMode,
  ...props
}: TimeFieldProps) {
  const cycle = hourCycle ?? (format === '12h' || format === '24h' ? format : undefined);
  const display = temporalFormatter(format, locale, precision, cycle, false);
  return (
    <TemporalField
      {...props}
      label="시간"
      display={display}
      serialize={(d) => timeKey(d, precision)}
      initialFocusSelector="[data-time-column]"
      picker={({ value, change }) => (
        <TimePicker
          value={value}
          onValueChange={change}
          precision={precision}
          format={cycle}
          step={step}
          min={min}
          max={max}
          locale={locale}
          variant={pickerVariant}
          selectionMode={selectionMode}
          size={props.size}
        />
      )}
    />
  );
}
export namespace TimeField {
  export type Props = TimeFieldProps;
  export type TriggerProps = SharedTriggerProps;
  export type ClearProps = TriggerProps;
  export type ValueProps = SharedValueProps;
  export type ContentProps = SharedContentProps;
  export const Trigger = TemporalTrigger,
    Value = TemporalValue,
    Content = TemporalContent,
    Clear = TemporalClear;
  export const Style = temporalFieldStyle;
}
