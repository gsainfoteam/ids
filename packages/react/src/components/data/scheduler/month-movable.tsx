'use client';

import { use, useState, type ReactNode, type RefCallback } from 'react';

import { useDraggable } from '@dnd-kit/core';

import { SchedulerContext, SchedulerDragContext, type SchedulerDragPiece } from './context';
import { swallowTheSpaceKeyupThatWouldPress } from '../../../internal/drag-surface';
import { keyHandler } from '../../../internal/keys';
import { readingDirection } from '../../../internal/resize-handle';
import { invariant, mergeRefs } from '../../../utils';

import type { SchedulerEventData } from './layout';

const DAYS_IN_WEEK = 7;

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
  const key = `${event.id}@${dayIndex}`;
  const [element, setElement] = useState<HTMLElement | null>(null);
  const piece: SchedulerDragPiece = { key, event, dayIndex, dayCount, element: () => element };
  const draggable = useDraggable({ id: key, data: piece });
  const ref: RefCallback<HTMLDivElement> = mergeRefs(draggable.setNodeRef, setElement);
  const grabbed = drag.grabbed?.key === key ? drag.grabbed : null;
  const offset = grabbed?.offset ?? draggable.transform;
  const dragging = draggable.isDragging || grabbed !== null;

  const pressSpace = (action: () => void) => () => {
    swallowTheSpaceKeyupThatWouldPress();
    action();
  };

  const nudge = (days: number) => () => drag.nudge({ days, minutes: 0 });

  return (
    <div
      ref={ref}
      {...draggable.listeners}
      data-scheduler-movable=""
      data-dragging={dragging ? '' : undefined}
      className={styles.monthMovable({ dragging })}
      style={{ translate: offset ? `${offset.x}px ${offset.y}px` : undefined }}
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
            : { Space: pressSpace(() => drag.grab(piece, keyDown.currentTarget)) },
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
