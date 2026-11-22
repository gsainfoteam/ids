'use client';

import { use, useState, type ReactNode, type RefCallback, type SyntheticEvent } from 'react';

import { useDraggable } from '@dnd-kit/core';

import { SchedulerContext, SchedulerDragContext } from './context';
import { HOURS_IN_DAY, SHORTEST_SHOWN_HOURS, SNAP_MINUTES, type SchedulerSegment } from './layout';
import { swallowTheSpaceKeyupThatWouldPress } from '../../../internal/drag-surface';
import { keyHandler } from '../../../internal/keys';
import { readingDirection } from '../../../internal/resize-handle';
import { useTranslate } from '../../../internal/translate';
import { invariant, mergeRefs } from '../../../utils';
import { Resizable } from '../../layout/resizable';

import type { CalendarDate } from '@internationalized/date';

const MINUTES_IN_HOUR = 60;

export type SchedulerMovableProps = {
  segment: SchedulerSegment;
  day: CalendarDate;
  dayIndex: number;
  dayCount: number;
  children: ReactNode;
};

const startsOnTheResizeHandle = (event: SyntheticEvent) =>
  event.target instanceof Element && event.target.closest('[data-resize-handle]') !== null;

export function SchedulerMovable({
  segment,
  day,
  dayIndex,
  dayCount,
  children,
}: SchedulerMovableProps) {
  const t = useTranslate();
  const scheduler = use(SchedulerContext);
  const drag = use(SchedulerDragContext);
  invariant(
    scheduler && drag,
    'SchedulerMovable must be rendered inside a Scheduler that moves events.',
  );
  const { styles } = scheduler;
  const key = `${segment.event.id}@${day.toString()}`;
  const [element, setElement] = useState<HTMLElement | null>(null);
  const slotData = { key, segment, day, dayIndex, dayCount, element: () => element };
  const draggable = useDraggable({ id: key, data: slotData });
  const ref: RefCallback<HTMLDivElement> = mergeRefs(draggable.setNodeRef, setElement);
  const grabbed = drag.grabbed?.key === key ? drag.grabbed : null;
  const offset = grabbed?.offset ?? draggable.transform;
  const dragging = draggable.isDragging || grabbed !== null;
  const { hourHeight } = drag;
  const resizable = segment.endsHere && hourHeight !== undefined;

  const listeners = Object.fromEntries(
    Object.entries(draggable.listeners ?? {}).map(([name, listener]) => [
      name,
      (event: SyntheticEvent) => {
        if (!startsOnTheResizeHandle(event)) listener(event);
      },
    ]),
  );

  const pressSpace = (action: () => void) => () => {
    swallowTheSpaceKeyupThatWouldPress();
    action();
  };

  const nudge = (days: number, minutes: number) => () => drag.nudge({ days, minutes });

  const slotElement = (
    <div
      ref={ref}
      {...listeners}
      data-scheduler-movable=""
      data-dragging={dragging ? '' : undefined}
      className={styles.movable({ dragging })}
      style={{ translate: offset ? `${offset.x}px ${offset.y}px` : undefined }}
      onDragStart={(event) => event.preventDefault()}
      onKeyDownCapture={(event) => {
        if (startsOnTheResizeHandle(event)) return;
        keyHandler<HTMLDivElement>(
          grabbed
            ? {
                ArrowUp: nudge(0, -SNAP_MINUTES),
                ArrowDown: nudge(0, SNAP_MINUTES),
                'Shift+ArrowUp': nudge(0, -MINUTES_IN_HOUR),
                'Shift+ArrowDown': nudge(0, MINUTES_IN_HOUR),
                ArrowLeft: nudge(-1, 0),
                ArrowRight: nudge(1, 0),
                Enter: () => drag.drop(),
                Space: pressSpace(drag.drop),
                Escape: () => drag.cancel(),
              }
            : {
                Space: pressSpace(() => drag.grab(slotData, event.currentTarget)),
              },
          readingDirection(event.currentTarget),
        )(event);
      }}
      onBlur={(event) => {
        if (grabbed && !event.currentTarget.contains(event.relatedTarget)) drag.cancel();
      }}
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
    <Resizable
      asChild
      direction="vertical"
      step={(hourHeight * SNAP_MINUTES) / MINUTES_IN_HOUR}
      height={segment.hours * hourHeight}
      minHeight={SHORTEST_SHOWN_HOURS * hourHeight}
      maxHeight={(HOURS_IN_DAY - segment.startHour) * hourHeight}
      getValueLabel={(height) => drag.endLabel(segment, day, height)}
      onHeightChange={(height) => drag.resize(segment, height)}
    >
      {slotElement}
    </Resizable>
  );
}
