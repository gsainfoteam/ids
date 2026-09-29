'use client';

import { type CSSProperties, type ReactNode } from 'react';

import { TelFieldContext } from './context';
import { TelFieldCountrySelect, type TelFieldCountrySelectProps } from './country-select';
import { TelFieldInput } from './input';
import { type CountryCode, type TelFieldFormat } from './phone';
import { telFieldStyle } from './style';
import { useTelField, type TelFieldInputProps } from './use-tel-field';
import { type FieldSurfaceVariant } from '../../../internal/field-surface';
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

export type { CountryCode, TelFieldFormat } from './phone';
export type { TelFieldInputProps } from './use-tel-field';
export type TelFieldVariant = FieldSurfaceVariant;
export type TelFieldState = TextControlState;

type StateValue<T> = T | ((state: TelFieldState) => T);

function resolve<T>(value: StateValue<T>, state: TelFieldState): T {
  return typeof value === 'function' ? (value as (state: TelFieldState) => T)(state) : value;
}

export function TelField({
  value,
  defaultValue = '',
  onValueChange,
  defaultCountry = 'KR',
  format = 'auto',
  locale = 'ko-KR',
  variant = 'outline',
  size,
  invalid,
  disabled,
  className,
  style,
  children,
  ...rootProps
}: TelField.Props) {
  const resolvedSize = useFieldSize(size) ?? 'standard';
  const { items, leading, input, trailing } = splitAroundInput<TelField.InputProps>(
    children,
    TelFieldInput,
    () => <TelFieldInput key="tel-field-input" />,
    'TelField',
  );
  const selects = countOf(items, TelFieldCountrySelect);
  invariant(selects <= 1, '`<TelField>` accepts at most one `<TelField.CountrySelect />`.');

  const field = useTelField({
    rootProps,
    input: input.props,
    value,
    defaultValue,
    onValueChange,
    defaultCountry,
    format,
    separateCountry: selects > 0,
    disabled,
    invalid,
    clearable: countOf(items, TextControlClear) > 0,
  });
  const state: TelFieldState = { size: resolvedSize, variant, ...field.state };
  const styles = telFieldStyle({ variant, size: resolvedSize });
  const own = [TelFieldCountrySelect, TextControlClear];

  return (
    <TelFieldContext value={{ field, state, locale, styles }}>
      <TextControlContext
        value={{ state, inputId: field.inputProps.id, clear: field.clear, styles }}
      >
        <div
          data-tel-field=""
          {...stateAttributes(state)}
          {...field.rootProps}
          className={styles.root({ className: resolve(className, state) })}
          style={resolve(style, state)}
        >
          <Adornments items={leading} own={own} marker="tel-field" className={styles.adornment()} />
          {input}
          <Adornments
            items={trailing}
            own={own}
            marker="tel-field"
            className={styles.adornment()}
          />
        </div>
        {field.hiddenInputName && (
          <input
            type="hidden"
            name={field.hiddenInputName}
            form={field.form}
            value={field.value}
            disabled={state.disabled}
          />
        )}
      </TextControlContext>
    </TelFieldContext>
  );
}

export namespace TelField {
  export type Props = TelFieldInputProps & {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    defaultCountry?: CountryCode;
    format?: TelFieldFormat;
    locale?: string;
    variant?: TelFieldVariant;
    size?: IdsSize;
    invalid?: boolean;
    disabled?: boolean;
    children?: ReactNode;
    className?: StateValue<string | undefined>;
    style?: StateValue<CSSProperties | undefined>;
  };
  export type State = TelFieldState;
  export type Variant = TelFieldVariant;
  export type Format = TelFieldFormat;
  export type InputProps = TelFieldInputProps & {
    asChild?: boolean;
    children?: ReactNode;
    className?: string;
    style?: CSSProperties;
  };
  export type CountrySelectProps = TelFieldCountrySelectProps;
  export type ClearProps = TextControlClearProps;

  export const Input = TelFieldInput;
  export const CountrySelect = TelFieldCountrySelect;
  export const Clear = TextControlClear;

  export const Style = telFieldStyle;
}

export type TelFieldProps = TelField.Props;
