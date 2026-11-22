'use client';

import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';

import { DndContext, type Announcements, type DragStartEvent } from '@dnd-kit/core';
import { toCalendarDateTime, type CalendarDate, type DateValue } from '@internationalized/date';
import { clamp } from 'es-toolkit';

import {
  SchedulerMonthDragContext,
  type SchedulerMonthDragValue,
  type SchedulerMonthPiece,
} from './context';
import { dayOfCell } from './context-menu';
import { focusTheEvent, useSchedulerSensors } from './drag';
import {
  dateOf,
  isAllDay,
  shiftedBy,
  type SchedulerEventChange,
  type SchedulerEventData,
} from './layout';
import { swallowTheClickThatEndsADrag } from '../../../internal/drag-surface';
import { useTranslate } from '../../../internal/translate';
import { compareDays } from '../calendar/date';

import type { SchedulerFormat } from './format';

const NOT_MOVED = { x: 0, y: 0 };
const MONTH_DAY = '[data-scheduler-month-day]';

type Moving = {
  piece: SchedulerMonthPiece;
  origin: CalendarDate;
  to: CalendarDate;
  offset: { x: number; y: number };
};

type Point = { clientX: number; clientY: number };

const pointOf = (event: Event | null): Point | null => {
  if (event instanceof MouseEvent) return event;
  if (typeof TouchEvent !== 'undefined' && event instanceof TouchEvent) {
    return event.touches[0] ?? event.changedTouches[0] ?? null;
  }
  return null;
};

export type SchedulerMonthDragProps = {
  events: readonly SchedulerEventData[];
  days: CalendarDate[];
  format: SchedulerFormat;
  canvasRef: RefObject<HTMLElement | null>;
  onEventChange: (event: SchedulerEventData, change: SchedulerEventChange) => void;
  children: ReactNode;
};

export function SchedulerMonthDrag({
  events,
  days,
  format,
  canvasRef,
  onEventChange,
  children,
}: SchedulerMonthDragProps) {
  const t = useTranslate();
  const sensors = useSchedulerSensors();
  const moving = useRef<Moving | null>(null);
  const stopFollowing = useRef<() => void>(() => {});
  const pendingFocus = useRef<string | null>(null);
  const [shown, setShown] = useState<Moving | null>(null);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    const id = pendingFocus.current;
    if (id === null) return;
    pendingFocus.current = null;
    focusTheEvent(canvasRef.current, id);
  }, [events, canvasRef]);

  useEffect(() => () => stopFollowing.current(), []);

  const cellOf = (day: CalendarDate) =>
    canvasRef.current?.querySelector<HTMLElement>(`[data-scheduler-month-day="${day.toString()}"]`);

  const dayAt = ({ clientX, clientY }: Point) => {
    const cell = document
      .elementsFromPoint(clientX, clientY)
      .find((element) => element.matches(MONTH_DAY) && canvasRef.current?.contains(element));
    return cell ? dayOfCell(cell) : null;
  };

  const offsetBetween = (origin: CalendarDate, to: CalendarDate) => {
    const from = cellOf(origin)?.getBoundingClientRect();
    const target = cellOf(to)?.getBoundingClientRect();
    return from && target ? { x: target.left - from.left, y: target.top - from.top } : NOT_MOVED;
  };

  const show = (next: Moving | null) => {
    moving.current = next;
    setShown(next);
  };

  const moveTo = (to: CalendarDate) => {
    const current = moving.current;
    if (!current || compareDays(current.to, to) === 0) return;
    show({ ...current, to, offset: offsetBetween(current.origin, to) });
  };

  const daysMoved = ({ origin, to }: Moving) => compareDays(to, origin);

  const shifted = (value: DateValue, days: number) => shiftedBy(value, { days, minutes: 0 });

  const startsAt = ({ piece }: Moving, days: number) => {
    const start = shifted(piece.event.start, days);
    return isAllDay(piece.event)
      ? format.fullDate(dateOf(start))
      : format.moment(toCalendarDateTime(start));
  };

  const finish = (current: Moving) => {
    const days = daysMoved(current);
    const { event } = current.piece;
    show(null);
    setAnnouncement(
      t(days ? 'scheduler.drag.end' : 'scheduler.drag.cancel', { event: event.title }),
    );
    if (!days) return;
    pendingFocus.current = event.id;
    onEventChange(event, { start: shifted(event.start, days), end: shifted(event.end, days) });
  };

  const followThePointer = (from: Point | null) => {
    let last = from;
    const follow = (event: Event) => {
      last = pointOf(event) ?? last;
      const day = last && dayAt(last);
      if (day) moveTo(day);
    };
    const followScroll = () => {
      const day = last && dayAt(last);
      if (day) moveTo(day);
    };
    window.addEventListener('pointermove', follow);
    window.addEventListener('touchmove', follow);
    window.addEventListener('scroll', followScroll, true);
    stopFollowing.current = () => {
      window.removeEventListener('pointermove', follow);
      window.removeEventListener('touchmove', follow);
      window.removeEventListener('scroll', followScroll, true);
      stopFollowing.current = () => {};
    };
  };

  const pieceOf = ({ active }: Pick<DragStartEvent, 'active'>) =>
    active.data.current as SchedulerMonthPiece | undefined;

  const titleOf = (piece: SchedulerMonthPiece | undefined) => piece?.event.title ?? '';

  const announcements: Announcements = {
    onDragStart: (event) => t('scheduler.drag.start', { event: titleOf(pieceOf(event)) }),
    onDragOver: () => undefined,
    onDragEnd: (event) => t('scheduler.drag.end', { event: titleOf(pieceOf(event)) }),
    onDragCancel: (event) => t('scheduler.drag.cancel', { event: titleOf(pieceOf(event)) }),
  };

  const first = days[0];

  const value: SchedulerMonthDragValue = {
    grabbed: shown && { key: shown.piece.key, offset: shown.offset },
    grab: (piece) => {
      show({ piece, origin: piece.day, to: piece.day, offset: NOT_MOVED });
      setAnnouncement(t('scheduler.drag.start', { event: piece.event.title }));
    },
    nudge: (by) => {
      const current = moving.current;
      if (!current) return;
      const index = clamp(compareDays(current.to, first) + by, 0, days.length - 1);
      moveTo(days[index]);
      const next = moving.current ?? current;
      setAnnouncement(t('scheduler.drag.at', { time: startsAt(next, daysMoved(next)) }));
    },
    drop: () => {
      if (moving.current) finish(moving.current);
    },
    cancel: () => {
      const current = moving.current;
      if (!current) return;
      show(null);
      setAnnouncement(t('scheduler.drag.cancel', { event: current.piece.event.title }));
    },
  };

  return (
    <SchedulerMonthDragContext value={value}>
      <DndContext
        sensors={sensors}
        accessibility={{
          announcements,
          screenReaderInstructions: { draggable: t('scheduler.drag.monthHint') },
        }}
        onDragStart={(event) => {
          const piece = pieceOf(event);
          if (!piece) return;
          const from = pointOf(event.activatorEvent);
          const origin = (from && dayAt(from)) ?? piece.day;
          show({ piece, origin, to: origin, offset: NOT_MOVED });
          followThePointer(from);
        }}
        onDragEnd={() => {
          stopFollowing.current();
          swallowTheClickThatEndsADrag();
          const current = moving.current;
          if (!current) return;
          const days = daysMoved(current);
          show(null);
          if (!days) return;
          const { event } = current.piece;
          onEventChange(event, {
            start: shifted(event.start, days),
            end: shifted(event.end, days),
          });
        }}
        onDragCancel={() => {
          stopFollowing.current();
          show(null);
        }}
      >
        {children}
      </DndContext>
      <span aria-live="assertive" className="sr-only">
        {announcement}
      </span>
    </SchedulerMonthDragContext>
  );
}
