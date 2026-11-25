'use client';

import { use, type ReactNode } from 'react';

import { invariant } from '../../../../utils';
import { SchedulerContext, SchedulerDragContext } from '../context';
import { useInternalSchedulerMonthMovable } from '../hooks/use-scheduler-month-movable';

import type { SchedulerEventData } from '../lib/layout';

export type SchedulerMonthMovableProps = {
  event: SchedulerEventData;
  dayIndex: number;
  dayCount: number;
  children: ReactNode;
};

export function SchedulerMonthMovable({
  event,
  dayIndex,
  dayCount,
  children,
}: SchedulerMonthMovableProps) {
  const scheduler = use(SchedulerContext);
  const drag = use(SchedulerDragContext);
  invariant(
    scheduler && drag,
    'SchedulerMonthMovable must be rendered inside a Scheduler that moves events.',
  );
  const { styles } = scheduler;
  const { ref, listeners, offset, dragging, onKeyDownCapture, onBlur } =
    useInternalSchedulerMonthMovable({ event, dayIndex, dayCount, drag });

  return (
    <div
      ref={ref}
      {...listeners}
      data-scheduler-movable=""
      data-dragging={dragging ? '' : undefined}
      className={styles.monthMovable({ dragging })}
      style={{ translate: offset ? `${offset.x}px ${offset.y}px` : undefined }}
      onDragStart={(dragStart) => dragStart.preventDefault()}
      onKeyDownCapture={onKeyDownCapture}
      onBlur={onBlur}
    >
      {children}
    </div>
  );
}
