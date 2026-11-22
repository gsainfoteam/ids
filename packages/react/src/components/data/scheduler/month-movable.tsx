'use client';

import { use, useState, type ReactNode, type RefCallback } from 'react';

import { useDraggable } from '@dnd-kit/core';

import { SchedulerContext, SchedulerMonthDragContext } from './context';
import { swallowTheSpaceKeyupThatWouldPress } from '../../../internal/drag-surface';
import { keyHandler } from '../../../internal/keys';
import { readingDirection } from '../../../internal/resize-handle';
import { invariant, mergeRefs } from '../../../utils';

import type { SchedulerEventData } from './layout';
import type { CalendarDate } from '@internationalized/date';

const DAYS_IN_WEEK = 7;

export type SchedulerMonthMovableProps = {
  event: SchedulerEventData;
  day: CalendarDate;
  children: ReactNode;
};

export function SchedulerMonthMovable({ event, day, children }: SchedulerMonthMovableProps) {
  const scheduler = use(SchedulerContext);
  const drag = use(SchedulerMonthDragContext);
  invariant(
    scheduler && drag,
    'SchedulerMonthMovable must be rendered inside a Scheduler that moves events.',
  );
  const { styles } = scheduler;
  const key = `${event.id}@${day.toString()}`;
  const [element, setElement] = useState<HTMLElement | null>(null);
  const piece = { key, event, day, element: () => element };
  const draggable = useDraggable({ id: key, data: piece });
  const ref: RefCallback<HTMLDivElement> = mergeRefs(draggable.setNodeRef, setElement);
  const grabbed = drag.grabbed?.key === key ? drag.grabbed : null;
  const dragging = draggable.isDragging || grabbed !== null;

  const pressSpace = (action: () => void) => () => {
    swallowTheSpaceKeyupThatWouldPress();
    action();
  };

  const nudge = (days: number) => () => drag.nudge(days);

  return (
    <div
      ref={ref}
      {...draggable.listeners}
      data-scheduler-movable=""
      data-dragging={dragging ? '' : undefined}
      className={styles.monthMovable({ dragging })}
      style={{ translate: grabbed ? `${grabbed.offset.x}px ${grabbed.offset.y}px` : undefined }}
      onDragStart={(dragStart) => dragStart.preventDefault()}
      onKeyDownCapture={(keyDown) => {
        keyHandler<HTMLDivElement>(
          grabbed
            ? {
                ArrowLeft: nudge(-1),
                ArrowRight: nudge(1),
                ArrowUp: nudge(-DAYS_IN_WEEK),
                ArrowDown: nudge(DAYS_IN_WEEK),
                Enter: () => drag.drop(),
                Space: pressSpace(drag.drop),
                Escape: () => drag.cancel(),
              }
            : { Space: pressSpace(() => drag.grab(piece)) },
          readingDirection(keyDown.currentTarget),
        )(keyDown);
      }}
      onBlur={(blur) => {
        if (grabbed && !blur.currentTarget.contains(blur.relatedTarget)) drag.cancel();
      }}
    >
      {children}
    </div>
  );
}
