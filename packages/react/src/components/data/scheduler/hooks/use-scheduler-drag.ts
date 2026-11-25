'use client';

import { useEffect, useRef, useState } from 'react';

import { toCalendarDateTime } from '@internationalized/date';

import { useInternalDragSensors } from '../../../../internal/hooks/use-drag-sensors';
import { swallowTheClickThatEndsADrag } from '../../../../internal/lib/drag-surface';
import { useInternalTranslate } from '../../../../internal/translate';
import { focusTheEvent } from '../lib/event-focus';
import {
  dateOf,
  isAllDay,
  isShifted,
  shiftedBy,
  snappedMinutes,
  type SchedulerShift,
} from '../lib/layout';

import type { SchedulerDragPiece, SchedulerDragValue } from '../context';
import type { SchedulerDragMeasure } from '../lib/drag-geometry';
import type { SchedulerDragProps } from '../parts/drag';
import type { Announcements, DragEndEvent, DragStartEvent, Modifier } from '@dnd-kit/core';

const MINUTES_IN_HOUR = 60;
const NOTHING_MOVED: SchedulerShift = { days: 0, minutes: 0 };

type Grab = { measure: SchedulerDragMeasure; shift: SchedulerShift };

type DragOptions<P extends SchedulerDragPiece> = Omit<
  SchedulerDragProps<P>,
  'hint' | 'autoScroll' | 'children'
>;

export function useInternalSchedulerDrag<P extends SchedulerDragPiece>({
  events,
  format,
  hourHeight,
  bodyRef,
  measure,
  onEventChange,
}: DragOptions<P>) {
  const t = useInternalTranslate();
  const pointer = useRef<SchedulerDragMeasure | null>(null);
  const pendingFocus = useRef<string | null>(null);
  const [grab, setGrab] = useState<Grab | null>(null);
  const [announcement, setAnnouncement] = useState('');

  const sensors = useInternalDragSensors();

  useEffect(() => {
    const id = pendingFocus.current;
    if (id === null) return;
    pendingFocus.current = null;
    focusTheEvent(bodyRef.current, id);
  }, [events, bodyRef]);

  const move = ({ event }: SchedulerDragPiece, shift: SchedulerShift) => {
    pendingFocus.current = event.id;
    onEventChange?.(event, {
      start: shiftedBy(event.start, shift),
      end: shiftedBy(event.end, shift),
    });
  };

  const startsAt = ({ event }: SchedulerDragPiece, shift: SchedulerShift) => {
    const start = shiftedBy(event.start, shift);
    return isAllDay(event)
      ? format.fullDate(dateOf(start))
      : format.moment(toCalendarDateTime(start));
  };

  const titleOf = (piece: SchedulerDragPiece) => piece.event.title;

  const pieceOf = ({ active }: Pick<DragStartEvent, 'active'>) =>
    active.data.current as P | undefined;

  const announced =
    (key: 'common.drag.start' | 'common.drag.end' | 'common.drag.cancel') =>
    (event: Pick<DragStartEvent, 'active'>) => {
      const piece = pieceOf(event);
      return piece && t(key, { item: titleOf(piece) });
    };

  const snapToTheGrid: Modifier = ({ transform }) => {
    const measured = pointer.current;
    if (!measured) return transform;
    return { ...transform, ...measured.offsetOf(measured.shiftOf(transform)) };
  };

  const announcements: Announcements = {
    onDragStart: announced('common.drag.start'),
    onDragOver: () => undefined,
    onDragEnd: announced('common.drag.end'),
    onDragCancel: announced('common.drag.cancel'),
  };

  const endGrab = (message: string) => {
    setGrab(null);
    setAnnouncement(message);
  };

  const value: SchedulerDragValue | null = onEventChange
    ? {
        hourHeight,
        grabbed: grab && {
          key: grab.measure.piece.key,
          offset: grab.measure.offsetOf(grab.shift),
        },
        grab: (piece, element) => {
          const measured = measure(piece as P, element);
          if (!measured) return;
          setGrab({ measure: measured, shift: NOTHING_MOVED });
          setAnnouncement(t('common.drag.start', { item: titleOf(piece) }));
        },
        nudge: (by) => {
          if (!grab) return;
          const shift = grab.measure.within({
            days: grab.shift.days + by.days,
            minutes: grab.shift.minutes + by.minutes,
          });
          setGrab({ ...grab, shift });
          setAnnouncement(t('scheduler.drag.at', { time: startsAt(grab.measure.piece, shift) }));
        },
        drop: () => {
          if (!grab) return;
          const { piece } = grab.measure;
          const moved = isShifted(grab.shift);
          endGrab(t(moved ? 'common.drag.end' : 'common.drag.cancel', { item: titleOf(piece) }));
          if (moved) move(piece, grab.shift);
        },
        cancel: () => {
          if (grab) endGrab(t('common.drag.cancel', { item: titleOf(grab.measure.piece) }));
        },
        resize: (segment, height) => {
          if (hourHeight === undefined || Math.abs(height - segment.hours * hourHeight) < 0.5)
            return;
          const minutes =
            snappedMinutes(segment.startHour + height / hourHeight) -
            Math.round(segment.endHour * MINUTES_IN_HOUR);
          if (minutes === 0) return;
          const { event } = segment;
          onEventChange?.(event, {
            start: event.start,
            end: shiftedBy(event.end, { days: 0, minutes }),
          });
        },
        endLabel: (segment, day, height) =>
          format.time(
            toCalendarDateTime(day).add({
              minutes: snappedMinutes(segment.startHour + height / (hourHeight ?? 1)),
            }),
          ),
      }
    : null;

  const onDragStart = (event: DragStartEvent) => {
    const piece = pieceOf(event);
    const element = piece?.element();
    value?.cancel();
    pointer.current = piece && element ? measure(piece, element) : null;
  };

  const onDragEnd = ({ delta }: DragEndEvent) => {
    const measured = pointer.current;
    pointer.current = null;
    swallowTheClickThatEndsADrag();
    if (!measured) return;
    const shift = measured.shiftOf(delta);
    if (isShifted(shift)) move(measured.piece, shift);
  };

  const onDragCancel = () => {
    pointer.current = null;
  };

  return {
    value,
    sensors,
    snapToTheGrid,
    announcements,
    announcement,
    onDragStart,
    onDragEnd,
    onDragCancel,
  };
}
