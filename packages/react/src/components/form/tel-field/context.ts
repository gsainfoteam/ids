'use client';

import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { TelFieldState } from '.';
import type { useInternalTelField } from './hooks/use-tel-field';
import type { telFieldStyle } from './style';

type TelFieldContextValue = {
  field: ReturnType<typeof useInternalTelField>;
  state: TelFieldState;
  locale: string;
  styles: ReturnType<typeof telFieldStyle>;
};

export const TelFieldContext = createContext<TelFieldContextValue | null>(null);

export function useInternalTelContext(part: string) {
  const context = use(TelFieldContext);
  invariant(context != null, `\`<TelField.${part}>\` must be used inside \`<TelField>\`.`);
  return context;
}
