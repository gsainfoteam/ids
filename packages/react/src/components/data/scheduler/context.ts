'use client';

import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { SchedulerFormat } from './format';
import type { SchedulerEventData } from './layout';
import type { schedulerStyle } from './style';
import type { CalendarDateTime } from '@internationalized/date';

export type SchedulerContextValue = {
  styles: ReturnType<typeof schedulerStyle>;
  format: SchedulerFormat;
};

export const SchedulerContext = createContext<SchedulerContextValue | null>(null);

export type SchedulerEventContextValue = {
  event: SchedulerEventData;
  start: CalendarDateTime;
  end: CalendarDateTime;
  allDay: boolean;
};

export const SchedulerEventContext = createContext<SchedulerEventContextValue | null>(null);

export function useSchedulerEventContext(part: string) {
  const scheduler = use(SchedulerContext);
  const event = use(SchedulerEventContext);
  invariant(
    scheduler && event,
    `${part} must be rendered by the function a Scheduler takes as its children.`,
  );

  return { ...scheduler, ...event };
}
