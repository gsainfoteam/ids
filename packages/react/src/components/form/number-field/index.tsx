import { type CSSProperties, type ReactNode } from 'react';

import { NumberFieldDecrement } from './decrement';
import { NumberFieldIncrement } from './increment';
import { NumberFieldInput } from './input';
import {
  NumberFieldRoot,
  type StateValue,
  type NumberFieldVariant,
  type NumberFieldState,
} from './root';
import { type NumberFieldStepProps } from './step-button';
import { NumberFieldStepper, type NumberFieldStepperProps } from './stepper';
import { numberFieldStyle } from './style';
import { type NumberFieldFormatOptions, type NumberFieldInputProps } from './use-number-field';
import { TextControlClear, type TextControlClearProps } from '../../../internal/text-control';

import type { IdsSize } from '../../../tokens/types';

export function NumberField(props: NumberField.Props) {
  return <NumberFieldRoot {...props} />;
}

export namespace NumberField {
  export type Props = NumberFieldInputProps & {
    value?: number | null;
    defaultValue?: number | null;
    onValueChange?: (value: number | null) => void;
    min?: number;
    max?: number;
    step?: number;
    smallStep?: number;
    largeStep?: number;
    locale?: string;
    formatOptions?: NumberFieldFormatOptions;
    allowWheelScrub?: boolean;
    hideStepper?: boolean;
    invalid?: boolean;
    disabled?: boolean;
    size?: IdsSize;
    variant?: NumberFieldVariant;
    incrementLabel?: string;
    decrementLabel?: string;
    children?: ReactNode;
    className?: StateValue<string | undefined>;
    style?: StateValue<CSSProperties | undefined>;
  };
  export type State = NumberFieldState;
  export type Variant = NumberFieldVariant;
  export type FormatOptions = NumberFieldFormatOptions;
  export type InputProps = NumberFieldInputProps & {
    asChild?: boolean;
    children?: ReactNode;
    className?: string;
    style?: CSSProperties;
  };
  export type StepperProps = NumberFieldStepperProps;
  export type StepProps = NumberFieldStepProps;
  export type ClearProps = TextControlClearProps;

  export const Input = NumberFieldInput;
  export const Increment = NumberFieldIncrement;
  export const Decrement = NumberFieldDecrement;
  export const Stepper = NumberFieldStepper;
  export const Clear = TextControlClear;

  export const Style = numberFieldStyle;
}

export type { NumberFieldVariant, NumberFieldState } from './root';
export type { NumberFieldFormatOptions, NumberFieldInputProps } from './use-number-field';

export type NumberFieldProps = NumberField.Props;
