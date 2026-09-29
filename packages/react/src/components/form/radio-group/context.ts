'use client';

import { createContext, useContext } from 'react';

import type { IdsSize } from '../../../tokens/types';

export type RadioGroupContextValue = {
  name: string;
  value: string | null;
  select: (value: string) => void;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  invalid: boolean;
  form: string | undefined;
  size: IdsSize | undefined;
  variant: 'outline' | 'soft' | undefined;
};

export const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export function useRadioGroupContext() {
  return useContext(RadioGroupContext);
}
