'use client';

import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { TelFieldState } from '.';
import type { telFieldStyle } from './style';
import type { useTelField } from './use-tel-field';

type TelFieldContextValue = {
  field: ReturnType<typeof useTelField>;
  state: TelFieldState;
  locale: string;
  styles: ReturnType<typeof telFieldStyle>;
};

export const TelFieldContext = createContext<TelFieldContextValue | null>(null);

export function useTelContext(part: string) {
  const context = use(TelFieldContext);
  invariant(context != null, `\`<TelField.${part}>\` must be used inside \`<TelField>\`.`);
  return context;
}
