'use client';

import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { HourCycle, TimePrecision } from '../../data/time-picker/time';
import type { Time } from '@internationalized/date';

type ContextValue = {
  precision: TimePrecision;
  hourCycle: HourCycle | undefined;
  step: number;
  min: Time | undefined;
  max: Time | undefined;
};

export const TimeFieldContext = createContext<ContextValue | null>(null);

export function useTimeFieldContext(part: string) {
  const context = use(TimeFieldContext);
  invariant(context, `${part} must be inside TimeField.`);
  return context;
}
