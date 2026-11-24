'use client';

import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { NumberFieldState } from '.';
import type { useInternalNumberField } from './hooks/use-number-field';
import type { numberFieldStyle } from './style';

type Field = ReturnType<typeof useInternalNumberField>;

type NumberFieldContextValue = {
  field: Field;
  state: NumberFieldState;
  styles: ReturnType<typeof numberFieldStyle>;
};

export const NumberFieldContext = createContext<NumberFieldContextValue | null>(null);

export const InsideStepperContext = createContext(false);

export function useInternalNumberContext(part: string) {
  const context = use(NumberFieldContext);
  invariant(context != null, `\`<NumberField.${part}>\` must be used inside \`<NumberField>\`.`);
  return context;
}
