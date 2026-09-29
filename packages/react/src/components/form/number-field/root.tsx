'use client';

import { NumberFieldContext } from './context';
import { NumberFieldDecrement } from './decrement';
import { NumberFieldIncrement } from './increment';
import { NumberFieldInput } from './input';
import { NumberFieldStepper } from './stepper';
import { numberFieldStyle } from './style';
import { useNumberField } from './use-number-field';
import { type FieldSurfaceVariant } from '../../../internal/field-surface';
import { messages } from '../../../internal/messages';
import {
  Adornments,
  TextControlClear,
  TextControlContext,
  countOf,
  splitAroundInput,
  stateAttributes,
  type TextControlState,
} from '../../../internal/text-control';
import { invariant } from '../../../utils';
import { useFieldSize } from '../field/context';

import type { NumberField } from '.';

export type NumberFieldVariant = FieldSurfaceVariant;
export type NumberFieldState = TextControlState;

export type StateValue<T> = T | ((state: NumberFieldState) => T);

function resolve<T>(value: StateValue<T>, state: NumberFieldState): T {
  return typeof value === 'function' ? (value as (state: NumberFieldState) => T)(state) : value;
}

export function NumberFieldRoot({
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
