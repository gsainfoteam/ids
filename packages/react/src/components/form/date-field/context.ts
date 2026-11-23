'use client';

import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { CalendarSelectionMode, DateLimits } from '../../data/calendar/date';

type ContextValue = DateLimits & {
  selectionMode: CalendarSelectionMode;
};

export const DateFieldContext = createContext<ContextValue | null>(null);

export function useDateFieldContext(part: string) {
  const context = use(DateFieldContext);
  invariant(context, `${part} must be inside DateField.`);
  return context;
}
