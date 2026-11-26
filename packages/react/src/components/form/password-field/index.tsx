import { type CSSProperties, type ReactNode } from 'react';

import { type PasswordFieldInputProps } from './hooks/use-password-field';
import { PasswordFieldCapsLock, type PasswordFieldCapsLockProps } from './parts/caps-lock';
import { PasswordFieldInput } from './parts/input';
import {
  PasswordFieldVisibilityToggle,
  type PasswordFieldVisibilityToggleProps,
} from './parts/visibility-toggle';
import {
  PasswordFieldRoot,
  type StateValue,
  type PasswordFieldVariant,
  type PasswordFieldState,
} from './root';
import { passwordFieldStyle } from './style';
import { TextControlClear, type TextControlClearProps } from '../../../internal/text-control';

import type { IdsSize } from '../../../tokens/types';

export function PasswordField(props: PasswordField.Props) {
  return <PasswordFieldRoot {...props} />;
}

export namespace PasswordField {
  export type Props = PasswordFieldInputProps & {
    variant?: PasswordFieldVariant;
    size?: IdsSize;
    disabled?: boolean;
    onValueChange?: (value: string) => void;
    visible?: boolean;
    defaultVisible?: boolean;
    onVisibleChange?: (visible: boolean) => void;
    children?: ReactNode;
    className?: StateValue<string | undefined>;
    style?: StateValue<CSSProperties | undefined>;
  };
  export type State = PasswordFieldState;
  export type Variant = PasswordFieldVariant;
  export type InputProps = PasswordFieldInputProps & {
    asChild?: boolean;
    children?: ReactNode;
    className?: string;
    style?: CSSProperties;
  };
  export type VisibilityToggleProps = PasswordFieldVisibilityToggleProps;
  export type CapsLockProps = PasswordFieldCapsLockProps;
  export type ClearProps = TextControlClearProps;

  export const Input = PasswordFieldInput;
  export const VisibilityToggle = PasswordFieldVisibilityToggle;
  export const CapsLock = PasswordFieldCapsLock;
  export const Clear = TextControlClear;

  export const Style = passwordFieldStyle;
}

export type { PasswordFieldVariant, PasswordFieldState } from './root';
export type { PasswordFieldInputProps } from './hooks/use-password-field';

export type PasswordFieldProps = PasswordField.Props;
