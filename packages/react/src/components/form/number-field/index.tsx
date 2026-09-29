import { type CSSProperties, type ReactNode } from 'react';

import { NumberFieldContext } from './context';
import { NumberFieldDecrement } from './decrement';
import { NumberFieldIncrement } from './increment';
import { NumberFieldInput } from './input';
import { type NumberFieldStepProps } from './step-button';
import { NumberFieldStepper, type NumberFieldStepperProps } from './stepper';
import { numberFieldStyle } from './style';
import {
  useNumberField,
  type NumberFieldFormatOptions,
  type NumberFieldInputProps,
} from './use-number-field';
import { type FieldSurfaceVariant } from '../../../internal/field-surface';
import { messages } from '../../../internal/messages';
import {
  Adornments,
  TextControlClear,
  TextControlContext,
  countOf,
  splitAroundInput,
  stateAttributes,
  type TextControlClearProps,
  type TextControlState,
} from '../../../internal/text-control';
import { invariant } from '../../../utils';
import { useFieldSize } from '../field/context';

import type { IdsSize } from '../../../tokens/types';

export type { NumberFieldFormatOptions, NumberFieldInputProps } from './use-number-field';
export type NumberFieldVariant = FieldSurfaceVariant;
export type NumberFieldState = TextControlState;

type StateValue<T> = T | ((state: NumberFieldState) => T);

function resolve<T>(value: StateValue<T>, state: NumberFieldState): T {
  return typeof value === 'function' ? (value as (state: NumberFieldState) => T)(state) : value;
}

export function NumberField({
  value,
  defaultValue = null,
  onValueChange,
  min,
  max,
  step,
  smallStep,
  largeStep,
  locale = 'en-US',
  formatOptions,
  allowWheelScrub = false,
  hideStepper = false,
  invalid,
  disabled,
  size,
  variant = 'outline',
  incrementLabel = messages.numberField.increment,
  decrementLabel = messages.numberField.decrement,
  className,
  style,
  children,
  ...rootProps
}: NumberField.Props) {
  const resolvedSize = useFieldSize(size) ?? 'standard';
  const { items, leading, input, trailing } = splitAroundInput<NumberField.InputProps>(
    children,
    NumberFieldInput,
    () => <NumberFieldInput />,
    'NumberField',
  );
  const steppers = countOf(items, NumberFieldStepper);
  invariant(steppers <= 1, 'NumberField: Stepper must be declared at most once.');
  const placesSteps =
    steppers + countOf(items, NumberFieldIncrement) + countOf(items, NumberFieldDecrement) > 0;

  const field = useNumberField({
    rootProps,
    input: input.props,
    value,
    defaultValue,
    onValueChange,
    min,
    max,
    step,
    smallStep,
    largeStep,
    locale,
    formatOptions,
    allowWheelScrub,
    disabled,
    invalid,
    clearable: countOf(items, TextControlClear) > 0,
  });
  const state: NumberFieldState = { size: resolvedSize, variant, ...field.state };
  const styles = numberFieldStyle({ variant, size: resolvedSize });
  const own = [NumberFieldStepper, NumberFieldIncrement, NumberFieldDecrement, TextControlClear];

  return (
    <NumberFieldContext value={{ field, state, incrementLabel, decrementLabel, styles }}>
      <TextControlContext
        value={{ state, inputId: field.inputProps.id, clear: field.clear, styles }}
      >
        <div
          data-number-field=""
          {...stateAttributes(state)}
          {...field.rootProps}
          className={styles.root({ className: resolve(className, state) })}
          style={resolve(style, state)}
        >
          <Adornments
            items={leading}
            own={own}
            marker="number-field"
            className={styles.adornment()}
          />
          {input}
          <Adornments
            items={trailing}
            own={own}
            marker="number-field"
            className={styles.adornment()}
          />
          {!hideStepper && !placesSteps && <NumberFieldStepper />}
        </div>
        {field.hiddenInputName && (
          <input
            type="hidden"
            name={field.hiddenInputName}
            form={field.form}
            disabled={state.disabled}
            value={field.value ?? ''}
          />
        )}
      </TextControlContext>
    </NumberFieldContext>
  );
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

export type NumberFieldProps = NumberField.Props;
