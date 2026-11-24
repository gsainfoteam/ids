'use client';

import { use, type ReactNode } from 'react';

import { useInternalTranslate } from '../../../../internal/translate';
import { invariant } from '../../../../utils';
import { Resizable } from '../../../layout/resizable';
import { SchedulerContext, SchedulerDragContext } from '../context';
import { useInternalSchedulerMovable } from '../hooks/use-scheduler-movable';

import type { SchedulerSegment } from '../lib/layout';
import type { CalendarDate } from '@internationalized/date';

export type SchedulerMovableProps = {
  segment: SchedulerSegment;
  day: CalendarDate;
  dayIndex: number;
  dayCount: number;
  children: ReactNode;
};

export function SchedulerMovable({
  segment,
  day,
  dayIndex,
  dayCount,
  children,
}: SchedulerMovableProps) {
  const t = useInternalTranslate();
  const scheduler = use(SchedulerContext);
  const drag = use(SchedulerDragContext);
  invariant(
    scheduler && drag,
    'SchedulerMovable must be rendered inside a Scheduler that moves events.',
  );
  const { styles } = scheduler;
  const { ref, listeners, offset, dragging, resizable, sizing, onKeyDownCapture, onBlur } =
    useInternalSchedulerMovable({ segment, day, dayIndex, dayCount, drag });

  const slotElement = (
    <div
      ref={ref}
      {...listeners}
      data-scheduler-movable=""
      data-dragging={dragging ? '' : undefined}
      className={styles.movable({ dragging })}
      style={{ translate: offset ? `${offset.x}px ${offset.y}px` : undefined }}
      onDragStart={(event) => event.preventDefault()}
      onKeyDownCapture={onKeyDownCapture}
      onBlur={onBlur}
    >
      {children}
      {resizable && (
        <Resizable.Handle
          aria-label={t('scheduler.resize', { event: segment.event.title })}
          className={styles.resizeHandle()}
        />
      )}
    </div>
  );

  if (!resizable) return slotElement;

  return (
    <Resizable asChild direction="vertical" resizable={sizing}>
      {slotElement}
    </Resizable>
  );
}
