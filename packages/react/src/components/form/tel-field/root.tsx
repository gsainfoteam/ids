'use client';

import { TelFieldContext } from './context';
import { TelFieldCountrySelect } from './country-select';
import { TelFieldInput } from './input';
import { telFieldStyle } from './style';
import { useTelField } from './use-tel-field';
import { type FieldSurfaceVariant } from '../../../internal/field-surface';
import {
  Adornments,
  TextControlClear,
  TextControlContext,
  countOf,
  splitAroundInput,
  stateAttributes,
  type TextControlState,
} from '../../../internal/text-control';
import { useProviderLocale } from '../../../internal/translate';
import { invariant } from '../../../utils';
import { useFieldSize } from '../field/context';

import type { TelField } from '.';

export type TelFieldVariant = FieldSurfaceVariant;
export type TelFieldState = TextControlState;

export type StateValue<T> = T | ((state: TelFieldState) => T);

function resolve<T>(value: StateValue<T>, state: TelFieldState): T {
  return typeof value === 'function' ? (value as (state: TelFieldState) => T)(state) : value;
}

export function TelFieldRoot({
  value,
  defaultValue = '',
  onValueChange,
  defaultCountry = 'KR',
  format = 'auto',
  locale: localeProp,
  variant = 'outline',
  size,
  invalid,
  disabled,
  className,
  style,
  children,
  ...rootProps
}: TelField.Props) {
  const providerLocale = useProviderLocale();
  const locale = localeProp ?? providerLocale ?? 'ko-KR';
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
