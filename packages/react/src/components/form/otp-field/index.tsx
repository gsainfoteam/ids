'use client';

import { type ChangeEvent, type ComponentProps, type CSSProperties, type ReactNode } from 'react';

import { OTPFieldCaret, type OTPFieldCaretProps } from './caret';
import { OTPContext } from './context';
import { OTPFieldGroup, type OTPFieldGroupProps } from './group';
import { lengthOnlyPattern, type OTPFieldPattern } from './otp-code';
import { OTPFieldSeparator, type OTPFieldSeparatorProps } from './separator';
import { OTPFieldSlot, type OTPFieldSlotProps } from './slot';
import { otpFieldStyle } from './style';
import { useOTPField, type OTPSlotState } from './use-otp-field';
import { messages } from '../../../internal/messages';
import { invariant, mergeProps } from '../../../utils';
import { useFieldSize } from '../field/context';

import type { IdsSize } from '../../../tokens/types';

export type { OTPFieldPattern } from './otp-code';
export type OTPFieldVariant = 'outline' | 'soft';

type NativeInputProps = Omit<
  ComponentProps<'input'>,
  | 'type'
  | 'size'
  | 'children'
  | 'value'
  | 'defaultValue'
  | 'pattern'
  | 'maxLength'
  | 'minLength'
  | 'placeholder'
  | 'className'
  | 'style'
>;

export type OTPFieldProps = NativeInputProps & {
  length: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  pattern?: OTPFieldPattern;
  mask?: boolean | string;
  placeholder?: string;
  invalid?: boolean;
  size?: IdsSize;
  variant?: OTPFieldVariant;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

const passwordManagerOptOut = {
  'data-1p-ignore': '',
  'data-lpignore': 'true',
  'data-bwignore': '',
  'data-form-type': 'other',
};

export function OTPField({
  length,
  value,
  defaultValue,
  onValueChange,
  onComplete,
  pattern = 'numeric',
  mask,
  placeholder,
  invalid,
  size,
  variant = 'outline',
  className,
  style,
  children,
  ref,
  onChange,
  ...inputProps
}: OTPFieldProps) {
  invariant(
    Number.isInteger(length) && length >= 1 && length <= 12,
    'OTPField: length must be an integer from 1 to 12.',
  );
  const resolvedSize = useFieldSize(size) ?? 'standard';
  const styles = otpFieldStyle({ size: resolvedSize, variant });
  const { state, handlers, rootRef, inputRef } = useOTPField({
    length,
    value,
    defaultValue,
    onValueChange,
    onComplete,
    pattern,
    disabled: inputProps.disabled,
    readOnly: inputProps.readOnly,
    ref,
  });

  const ariaInvalid = inputProps['aria-invalid'] ?? invalid;
  const isInvalid = ariaInvalid === true || ariaInvalid === 'true';
  const labelled =
    inputProps['aria-label'] !== undefined ||
    inputProps['aria-labelledby'] !== undefined ||
    inputProps.id !== undefined;

  const cleanBeforeOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    handlers.onChange(event);
    onChange?.(event);
  };

  const input = mergeProps(
    {
      type: 'text',
      autoComplete: 'one-time-code',
      inputMode: pattern === 'numeric' ? ('numeric' as const) : ('text' as const),
      autoCapitalize: 'none',
      autoCorrect: 'off',
      spellCheck: false,
      'aria-label': labelled ? undefined : messages.otpField.label,
      ...passwordManagerOptOut,
      ...inputProps,
    },
    {
      ...handlers,
      onChange: cleanBeforeOnChange,
      value: state.display,
      maxLength: length,
      pattern: lengthOnlyPattern(length),
      'aria-invalid': ariaInvalid,
      className: styles.input(),
    },
  );

  return (
    <OTPContext.Provider value={{ slots: state.slots, mask, placeholder, styles }}>
      <div
        ref={rootRef}
        className={styles.root({ className })}
        style={style}
        data-otp-field=""
        data-size={resolvedSize}
        data-variant={variant}
        data-focused={state.focused ? '' : undefined}
        data-complete={state.code.length === length ? '' : undefined}
        data-invalid={isInvalid ? '' : undefined}
        data-disabled={inputProps.disabled ? '' : undefined}
        data-readonly={inputProps.readOnly ? '' : undefined}
      >
        {children ?? (
          <OTPFieldGroup>
            {state.slots.map((slot) => (
              <OTPFieldSlot key={slot.index} index={slot.index} />
            ))}
          </OTPFieldGroup>
        )}
        <input {...input} ref={inputRef} />
      </div>
    </OTPContext.Provider>
  );
}

export namespace OTPField {
  export type Props = OTPFieldProps;
  export type Variant = OTPFieldVariant;
  export type SlotState = OTPSlotState;

  export type GroupProps = OTPFieldGroupProps;

  export type SlotProps = OTPFieldSlotProps;

  export type SeparatorProps = OTPFieldSeparatorProps;

  export type CaretProps = OTPFieldCaretProps;

  export const Group = OTPFieldGroup;
  export const Slot = OTPFieldSlot;
  export const Separator = OTPFieldSeparator;
  export const Caret = OTPFieldCaret;

  export const Style = otpFieldStyle;
}
