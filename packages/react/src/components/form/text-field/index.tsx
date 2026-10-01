import { type CSSProperties, type ReactNode } from 'react';

import {
  TextFieldRoot,
  TextFieldInput,
  type StateValue,
  type TextFieldVariant,
  type TextFieldState,
} from './root';
import { type TextFieldInputProps } from './use-text-field';
import { TextControlClear, type TextControlClearProps } from '../../../internal/text-control';
import { textControlStyle } from '../../../internal/text-control/style';

import type { IdsSize } from '../../../tokens/types';

export function TextField(props: TextField.Props) {
  return <TextFieldRoot {...props} />;
}

export namespace TextField {
  export type Props = TextFieldInputProps & {
    variant?: TextFieldVariant;
    size?: IdsSize;
    disabled?: boolean;
    invalid?: boolean;
    onValueChange?: (value: string) => void;
    children?: ReactNode;
    className?: StateValue<string | undefined>;
    style?: StateValue<CSSProperties | undefined>;
  };
  export type State = TextFieldState;
  export type Variant = TextFieldVariant;
  export type ClearProps = TextControlClearProps;

  export const Input = TextFieldInput;

  export namespace Input {
    export type Props = TextFieldInputProps & {
      asChild?: boolean;
      children?: ReactNode;
      className?: string;
      style?: CSSProperties;
    };
  }

  export const Clear = TextControlClear;

  export const Style = textControlStyle;
}

export type { TextFieldVariant, TextFieldState } from './root';
export type { TextFieldInputProps } from './use-text-field';

export type TextFieldProps = TextField.Props;
