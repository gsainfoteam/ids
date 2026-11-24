'use client';

import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { TimePickerApi } from './hooks/use-time-picker';
import type { timePickerStyle } from './style';

type ContextValue = TimePickerApi & {
  styles: ReturnType<typeof timePickerStyle>;
  periodLeads: boolean;
};

export const TimePickerContext = createContext<ContextValue | null>(null);

export function useInternalTimePickerContext(part: string) {
  const context = use(TimePickerContext);
  invariant(context, `${part} must be inside TimePicker.`);
  return context;
}
