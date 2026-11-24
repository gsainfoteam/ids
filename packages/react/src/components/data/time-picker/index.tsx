import { type TimePickerOptionState, type TimePickerState } from './hooks/use-time-picker';
import { TimePickerColumn, type TimePickerColumnProps } from './parts/column';
import { TimePickerHeader } from './parts/header';
import { TimePickerPeriod, type TimePickerPeriodProps } from './parts/period';
import { TimePickerSeparator, type TimePickerSeparatorProps } from './parts/separator';
import { TimePickerRoot, type TimePickerVariant, type TimePickerProps } from './root';
import { timePickerStyle } from './style';

export function TimePicker(props: TimePickerProps) {
  return <TimePickerRoot {...props} />;
}

export namespace TimePicker {
  export type Props = TimePickerProps;
  export type State = TimePickerState;
  export type OptionState = TimePickerOptionState;
  export type Variant = TimePickerVariant;
  export type ColumnProps = TimePickerColumnProps;
  export type PeriodProps = TimePickerPeriodProps;
  export type SeparatorProps = TimePickerSeparatorProps;

  export const Column = TimePickerColumn;

  export const Period = TimePickerPeriod;

  export const Header = TimePickerHeader;

  export const Separator = TimePickerSeparator;

  export const Style = timePickerStyle;
}

export type { TimePickerVariant, TimePickerOptions, TimePickerProps } from './root';

export type { TimePrecision, HourCycle } from './lib/time';

export type { TimePickerOptionState, TimePickerState } from './hooks/use-time-picker';
