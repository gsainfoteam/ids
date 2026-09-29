import { TimePickerColumn, type TimePickerColumnProps } from './column';
import { TimePickerHeader } from './header';
import { TimePickerPeriod, type TimePickerPeriodProps } from './period';
import { TimePickerRoot, type TimePickerVariant, type TimePickerProps } from './root';
import { TimePickerSeparator, type TimePickerSeparatorProps } from './separator';
import { timePickerStyle } from './style';
import { type TimePickerOptionState, type TimePickerState } from './use-time-picker';

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

export type { TimePrecision, HourCycle } from './time';

export type { TimePickerOptionState, TimePickerState } from './use-time-picker';
