'use client';

import { useState, type FocusEvent, type KeyboardEvent, type RefCallback } from 'react';

import { useDraggable } from '@dnd-kit/core';

import { swallowTheSpaceKeyupThatWouldPress } from '../../../../internal/lib/drag-surface';
import { keyHandler } from '../../../../internal/lib/keys';
import { readingDirection } from '../../../../internal/resize-handle';
import { mergeRefs } from '../../../../utils';

import type { SchedulerDragPiece, SchedulerDragValue } from '../context';
import type { SchedulerEventData } from '../lib/layout';

const DAYS_IN_WEEK = 7;

type MonthMovableOptions = {
  event: SchedulerEventData;
  dayIndex: number;
  dayCount: number;
  drag: SchedulerDragValue;
};

export function useInternalSchedulerMonthMovable({
  event,
  dayIndex,
  dayCount,
  drag,
}: MonthMovableOptions) {
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

  const onKeyDownCapture = (keyDown: KeyboardEvent<HTMLDivElement>) => {
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
  };

  const onBlur = (blur: FocusEvent<HTMLDivElement>) => {
    if (grabbed && !blur.currentTarget.contains(blur.relatedTarget)) drag.cancel();
  };

  return { ref, listeners: draggable.listeners, offset, dragging, onKeyDownCapture, onBlur };
}
