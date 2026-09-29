import { OTPFieldCaret, type OTPFieldCaretProps } from './caret';
import { OTPFieldGroup, type OTPFieldGroupProps } from './group';
import { OTPFieldRoot, type OTPFieldVariant, type OTPFieldProps } from './root';
import { OTPFieldSeparator, type OTPFieldSeparatorProps } from './separator';
import { OTPFieldSlot, type OTPFieldSlotProps } from './slot';
import { otpFieldStyle } from './style';
import { type OTPSlotState } from './use-otp-field';

export function OTPField(props: OTPFieldProps) {
  return <OTPFieldRoot {...props} />;
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

export type { OTPFieldVariant, OTPFieldProps } from './root';
export type { OTPFieldPattern } from './otp-code';
