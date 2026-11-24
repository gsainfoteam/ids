'use client';

import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { OTPSlotState } from './hooks/use-otp-field';
import type { otpFieldStyle } from './style';

type Context = {
  slots: OTPSlotState[];
  mask: boolean | string | undefined;
  placeholder: string | undefined;
  invalid: boolean;
  styles: ReturnType<typeof otpFieldStyle>;
};

export const OTPContext = createContext<Context | null>(null);
export const GroupContext = createContext(false);

export function useInternalOTPContext(part: string) {
  const context = use(OTPContext);
  invariant(context, `${part} must be rendered inside OTPField.`);
  return context;
}
