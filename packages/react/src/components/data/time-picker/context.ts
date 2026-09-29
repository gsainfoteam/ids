'use client';

import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { timePickerStyle } from './style';
import type { TimePickerApi } from './use-time-picker';

type ContextValue = TimePickerApi & {
  styles: ReturnType<typeof timePickerStyle>;
  periodLeads: boolean;
};

export const TimePickerContext = createContext<ContextValue | null>(null);

export function useTimePickerContext(part: string) {
  const context = use(TimePickerContext);
  invariant(context, `${part} must be inside TimePicker.`);
  return context;
}
