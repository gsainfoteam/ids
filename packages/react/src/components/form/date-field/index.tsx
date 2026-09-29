import { DateFieldRoot, type DateFieldProps } from './root';
import {
  TemporalClear,
  TemporalContent,
  TemporalInput,
  TemporalTrigger,
  TemporalValue,
  type ClearProps as SharedClearProps,
  type ContentProps as SharedContentProps,
  type InputProps as SharedInputProps,
  type TemporalFieldState,
  type TriggerProps as SharedTriggerProps,
  type ValueProps as SharedValueProps,
} from '../../../internal/temporal-field';
import { temporalFieldStyle } from '../../../internal/temporal-field/style';
import { type CalendarValue } from '../../data/calendar/date';

export function DateField(props: DateFieldProps) {
  return <DateFieldRoot {...props} />;
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

export type { DateFieldFormat, DateFieldProps } from './root';
