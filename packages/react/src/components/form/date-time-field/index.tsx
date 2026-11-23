import { type CalendarDateTime } from '@internationalized/date';

import { DateTimeFieldCalendar, type DateTimeFieldCalendarProps } from './calendar';
import { DateTimeFieldRoot, type DateTimeFieldProps } from './root';
import { DateTimeFieldTimePicker, type DateTimeFieldTimePickerProps } from './time-picker';
import {
  TemporalClear,
  TemporalContent,
  TemporalTrigger,
  TemporalValue,
  type ClearProps as SharedClearProps,
  type ContentProps as SharedContentProps,
  type TemporalFieldState,
  type TriggerProps as SharedTriggerProps,
  type ValueProps as SharedValueProps,
} from '../../../internal/temporal-field';
import { temporalFieldStyle } from '../../../internal/temporal-field/style';

export function DateTimeField(props: DateTimeFieldProps) {
  return <DateTimeFieldRoot {...props} />;
}

export namespace DateTimeField {
  export type Props = DateTimeFieldProps;
  export type State = TemporalFieldState<CalendarDateTime | null>;
  export type TriggerProps = SharedTriggerProps;
  export type ValueProps = SharedValueProps;
  export type ClearProps = SharedClearProps;
  export type ContentProps = SharedContentProps;
  export type CalendarProps = DateTimeFieldCalendarProps;
  export type TimePickerProps = DateTimeFieldTimePickerProps;
  export const Trigger = TemporalTrigger;
  export const Value = TemporalValue;
  export const Clear = TemporalClear;
  export const Content = TemporalContent;
  export const Calendar = DateTimeFieldCalendar;
  export namespace Calendar {
    export type Props = DateTimeFieldCalendarProps;
  }
  export const TimePicker = DateTimeFieldTimePicker;
  export namespace TimePicker {
    export type Props = DateTimeFieldTimePickerProps;
  }
  export const Style = temporalFieldStyle;
}

export type { DateTimeFieldProps } from './root';
export type { DateTimeFieldCalendarProps } from './calendar';
export type { DateTimeFieldTimePickerProps } from './time-picker';
