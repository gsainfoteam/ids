'use client';

import type { ReactNode } from 'react';

import type { CalendarDayState } from './root';
import type { CalendarModifiers } from './use-calendar';
import type { CalendarDate } from '@internationalized/date';

export type CalendarDayProps = {
  modifiers?: CalendarModifiers;
  className?: string;
  children?: (date: CalendarDate, state: CalendarDayState) => ReactNode;
};

export function CalendarDay(props: CalendarDayProps): ReactNode {
  void props;
  return null;
}

CalendarDay.displayName = 'Calendar.Day';
