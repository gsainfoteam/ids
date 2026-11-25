'use client';

import {
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type RefCallback,
  type SyntheticEvent,
} from 'react';

import { useDraggable } from '@dnd-kit/core';

import { swallowTheSpaceKeyupThatWouldPress } from '../../../../internal/lib/drag-surface';
import { keyHandler } from '../../../../internal/lib/keys';
import { readingDirection } from '../../../../internal/resize-handle';
import { mergeRefs } from '../../../../utils';
import { useResizable } from '../../../layout/resizable';
import {
  HOURS_IN_DAY,
  SHORTEST_SHOWN_HOURS,
  SNAP_MINUTES,
  type SchedulerSegment,
} from '../lib/layout';
import { startsOnTheResizeHandle } from '../lib/resize-handle-target';

import type { SchedulerDragValue } from '../context';
import type { CalendarDate } from '@internationalized/date';

const MINUTES_IN_HOUR = 60;

type MovableOptions = {
  segment: SchedulerSegment;
  day: CalendarDate;
  dayIndex: number;
  dayCount: number;
  drag: SchedulerDragValue;
};

export function useInternalSchedulerMovable({
  segment,
  day,
  dayIndex,
  dayCount,
  drag,
}: MovableOptions) {
  const key = `${segment.event.id}@${day.toString()}`;
  const [element, setElement] = useState<HTMLElement | null>(null);
  const slotData = {
    key,
    event: segment.event,
    segment,
    day,
    dayIndex,
    dayCount,
    element: () => element,
  };
  const draggable = useDraggable({ id: key, data: slotData });
  const ref: RefCallback<HTMLDivElement> = mergeRefs(draggable.setNodeRef, setElement);
  const grabbed = drag.grabbed?.key === key ? drag.grabbed : null;
  const offset = grabbed?.offset ?? draggable.transform;
  const dragging = draggable.isDragging || grabbed !== null;
  const { hourHeight } = drag;
  const resizable = segment.endsHere && hourHeight !== undefined;
  const pixelsPerHour = hourHeight ?? 0;
  const sizing = useResizable({
    height: {
      value: segment.hours * pixelsPerHour,
      onValueChange: (height) => drag.resize(segment, height),
      min: SHORTEST_SHOWN_HOURS * pixelsPerHour,
      max: (HOURS_IN_DAY - segment.startHour) * pixelsPerHour,
    },
    step: (pixelsPerHour * SNAP_MINUTES) / MINUTES_IN_HOUR,
    getValueLabel: (height) => drag.endLabel(segment, day, height),
  });

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

  const onKeyDownCapture = (event: KeyboardEvent<HTMLDivElement>) => {
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
  };

  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (grabbed && !event.currentTarget.contains(event.relatedTarget)) drag.cancel();
  };

  return { ref, listeners, offset, dragging, resizable, sizing, onKeyDownCapture, onBlur };
}
