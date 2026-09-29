import { TimeFieldRoot, type TimeFieldProps } from './root';
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

import type { Time } from '@internationalized/date';

export function TimeField(props: TimeFieldProps) {
  return <TimeFieldRoot {...props} />;
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

export type { TimeFieldProps } from './root';
