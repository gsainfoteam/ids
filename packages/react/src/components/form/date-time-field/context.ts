'use client';

import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { DateTimeLimits } from './date-time';
import type { HourCycle } from '../../data/time-picker/time';
import type { CalendarDate } from '@internationalized/date';

type ContextValue = {
  today: CalendarDate;
  limits: DateTimeLimits;
  hourCycle: HourCycle | undefined;
};

export const DateTimeFieldContext = createContext<ContextValue | null>(null);

export function useDateTimeFieldContext(part: string) {
  const context = use(DateTimeFieldContext);
  invariant(context, `${part} must be inside DateTimeField.`);
  return context;
}
