'use client';

import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { SchedulerFormat } from './lib/format';
import type { SchedulerEventData, SchedulerSegment, SchedulerShift } from './lib/layout';
import type { schedulerStyle } from './style';
import type { CalendarDate, CalendarDateTime } from '@internationalized/date';

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
  inMonth?: boolean;
  line?: boolean;
  fromBefore?: boolean;
  pastEnd?: boolean;
};

export const SchedulerEventContext = createContext<SchedulerEventContextValue | null>(null);

export function useInternalSchedulerEventContext(part: string) {
  const scheduler = use(SchedulerContext);
  const event = use(SchedulerEventContext);
  invariant(
    scheduler && event,
    `${part} must be rendered by the function a Scheduler takes as its children.`,
  );

  return { ...scheduler, ...event };
}

export type SchedulerDragPiece = {
  key: string;
  event: SchedulerEventData;
  dayIndex: number;
  dayCount: number;
  element: () => HTMLElement | null;
};

export type SchedulerSlotData = SchedulerDragPiece & {
  segment: SchedulerSegment;
  day: CalendarDate;
};

export type SchedulerDragValue = {
  hourHeight: number | undefined;
  grabbed: { key: string; offset: { x: number; y: number } } | null;
  grab: (piece: SchedulerDragPiece, element: HTMLElement) => void;
  nudge: (by: SchedulerShift) => void;
  drop: () => void;
  cancel: () => void;
  resize: (segment: SchedulerSegment, height: number) => void;
  endLabel: (segment: SchedulerSegment, day: CalendarDate, height: number) => string;
};

export const SchedulerDragContext = createContext<SchedulerDragValue | null>(null);
