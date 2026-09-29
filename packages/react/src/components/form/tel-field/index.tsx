import { type CSSProperties, type ReactNode } from 'react';

import { TelFieldCountrySelect, type TelFieldCountrySelectProps } from './country-select';
import { TelFieldInput } from './input';
import { type CountryCode, type TelFieldFormat } from './phone';
import { TelFieldRoot, type StateValue, type TelFieldVariant, type TelFieldState } from './root';
import { telFieldStyle } from './style';
import { type TelFieldInputProps } from './use-tel-field';
import { TextControlClear, type TextControlClearProps } from '../../../internal/text-control';

import type { IdsSize } from '../../../tokens/types';

export function TelField(props: TelField.Props) {
  return <TelFieldRoot {...props} />;
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

export type { TelFieldVariant, TelFieldState } from './root';
export type { CountryCode, TelFieldFormat } from './phone';
export type { TelFieldInputProps } from './use-tel-field';

export type TelFieldProps = TelField.Props;
