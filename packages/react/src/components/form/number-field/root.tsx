'use client';

import { NumberFieldContext } from './context';
import { useInternalNumberField } from './hooks/use-number-field';
import { NumberFieldDecrement } from './parts/decrement';
import { NumberFieldIncrement } from './parts/increment';
import { NumberFieldInput } from './parts/input';
import { NumberFieldStepper } from './parts/stepper';
import { numberFieldStyle } from './style';
import { type FieldSurfaceVariant } from '../../../internal/surfaces/lib/field-surface';
import {
  Adornments,
  TextControlClear,
  TextControlContext,
  countOf,
  splitAroundInput,
  stateAttributes,
  writesNoneOf,
  type TextControlState,
} from '../../../internal/text-control';
import { useInternalProviderLocale } from '../../../internal/translate';
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
  formatOptions,
  disabled,
  size,
  variant = 'outline',
  className,
  style,
  children,
  ...rootProps
}: NumberField.Props) {
  const locale = useInternalProviderLocale();

  const resolvedSize = useFieldSize(size) ?? 'standard';
  const { items, leading, input, trailing } = splitAroundInput<NumberField.InputProps>(
    children,
    NumberFieldInput,
    () => <NumberFieldInput />,
    'NumberField',
  );
  invariant(
    countOf(items, NumberFieldStepper) <= 1,
    'NumberField: Stepper must be declared at most once.',
  );
  const own = [NumberFieldStepper, NumberFieldIncrement, NumberFieldDecrement, TextControlClear];
  const drawsDefaultParts = writesNoneOf(items, [NumberFieldInput, ...own]);

  const field = useInternalNumberField({
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
    disabled,
    clearable: countOf(items, TextControlClear) > 0,
  });
  const state: NumberFieldState = { size: resolvedSize, variant, ...field.state };
  const styles = numberFieldStyle({ variant, size: resolvedSize });

  return (
    <NumberFieldContext value={{ field, state, styles }}>
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
          {drawsDefaultParts && <NumberFieldStepper />}
        </div>
        {field.hiddenInputName && field.value != null && (
          <input
            type="hidden"
            name={field.hiddenInputName}
            form={field.form}
            disabled={state.disabled}
            value={field.value}
          />
        )}
      </TextControlContext>
    </NumberFieldContext>
  );
}
