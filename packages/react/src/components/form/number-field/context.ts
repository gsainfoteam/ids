'use client';

import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { NumberFieldState } from '.';
import type { numberFieldStyle } from './style';
import type { useNumberField } from './use-number-field';

type Field = ReturnType<typeof useNumberField>;

type NumberFieldContextValue = {
  field: Field;
  state: NumberFieldState;
  styles: ReturnType<typeof numberFieldStyle>;
};

export const NumberFieldContext = createContext<NumberFieldContextValue | null>(null);

export const InsideStepperContext = createContext(false);

export function useNumberContext(part: string) {
  const context = use(NumberFieldContext);
  invariant(context != null, `\`<NumberField.${part}>\` must be used inside \`<NumberField>\`.`);
  return context;
}
