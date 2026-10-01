import { type CSSProperties, type ReactNode } from 'react';

import { PasswordFieldCapsLock, type PasswordFieldCapsLockProps } from './caps-lock';
import { PasswordFieldInput } from './input';
import {
  PasswordFieldRoot,
  type StateValue,
  type PasswordFieldVariant,
  type PasswordFieldState,
} from './root';
import { passwordFieldStyle } from './style';
import { type PasswordFieldInputProps } from './use-password-field';
import {
  PasswordFieldVisibilityToggle,
  type PasswordFieldVisibilityToggleProps,
} from './visibility-toggle';
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
    invalid?: boolean;
    onValueChange?: (value: string) => void;
    visible?: boolean;
    defaultVisible?: boolean;
    onVisibleChange?: (visible: boolean) => void;
    hideVisibilityToggle?: boolean;
    hideCapsLock?: boolean;
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
export type { PasswordFieldInputProps } from './use-password-field';

export type PasswordFieldProps = PasswordField.Props;
