'use client';

import { createContext, useContext } from 'react';

import type { IdsSize } from '../../../tokens/types';
import type { CheckedState } from '../checkbox/use-checkbox';

export type CheckboxGroupContextValue = {
  value: readonly string[];
  toggle: (value: string, checked: boolean) => void;
  register: (value: string, id: string, disabled: boolean) => () => void;
  all: CheckedState;
  setAll: (checked: boolean) => void;
  controls: readonly string[];
  name: string | undefined;
  form: string | undefined;
  disabled: boolean;
  readOnly: boolean;
  invalid: boolean;
  size: IdsSize | undefined;
  variant: 'outline' | 'soft' | undefined;
};

export const CheckboxGroupContext = createContext<CheckboxGroupContextValue | null>(null);

export function useCheckboxGroupContext() {
  return useContext(CheckboxGroupContext);
}
