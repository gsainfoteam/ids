'use client';

import { type ReactNode } from 'react';

import type { SchedulerEventData, SchedulerSlot } from '../lib/layout';

export type SchedulerEventMenuPartProps<E extends SchedulerEventData = SchedulerEventData> = {
  children: (event: E) => ReactNode;
};

export type SchedulerSlotMenuPartProps = {
  children: (slot: SchedulerSlot) => ReactNode;
};

export function SchedulerEventMenu<E extends SchedulerEventData = SchedulerEventData>(
  _readByTheRoot: SchedulerEventMenuPartProps<E>,
) {
  return null;
}

SchedulerEventMenu.displayName = 'Scheduler.EventMenu';

export function SchedulerSlotMenu(_readByTheRoot: SchedulerSlotMenuPartProps) {
  return null;
}

SchedulerSlotMenu.displayName = 'Scheduler.SlotMenu';
