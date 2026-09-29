'use client';

import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { otpFieldStyle } from './style';
import type { OTPSlotState } from './use-otp-field';

type Context = {
  slots: OTPSlotState[];
  mask: boolean | string | undefined;
  placeholder: string | undefined;
  styles: ReturnType<typeof otpFieldStyle>;
};

export const OTPContext = createContext<Context | null>(null);
export const GroupContext = createContext(false);

export function useOTPContext(part: string) {
  const context = use(OTPContext);
  invariant(context, `${part} must be rendered inside OTPField.`);
  return context;
}
