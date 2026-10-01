import { type CalendarDateTime } from '@internationalized/date';

import { DateTimeFieldRoot, type DateTimeFieldProps } from './root';
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
  export const Trigger = TemporalTrigger;
  export const Value = TemporalValue;
  export const Clear = TemporalClear;
  export const Content = TemporalContent;
  export const Style = temporalFieldStyle;
}

export type { DateTimeFieldProps } from './root';
