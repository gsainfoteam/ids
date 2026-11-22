'use client';

import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';

import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragStartEvent,
  type Modifier,
} from '@dnd-kit/core';
import { toCalendarDateTime } from '@internationalized/date';
import { clamp } from 'es-toolkit';

import { SchedulerDragContext, type SchedulerDragValue, type SchedulerSlotData } from './context';
import {
  HOURS_IN_DAY,
  isShifted,
  shiftedBy,
  snappedMinutes,
  SNAP_MINUTES,
  type SchedulerEventChange,
  type SchedulerEventData,
  type SchedulerSegment,
  type SchedulerShift,
} from './layout';
import { swallowTheClickThatEndsADrag } from '../../../internal/drag-surface';
import { isRightToLeft } from '../../../internal/resize-handle';
import { useTranslate } from '../../../internal/translate';

import type { SchedulerFormat } from './format';

const POINTER_TRAVEL_BEFORE_DRAG = 4;
const TOUCH_HOLD_BEFORE_DRAG = 250;
const TOUCH_TRAVEL_ALLOWED_WHILE_HOLDING = 5;
const MINUTES_IN_HOUR = 60;
const MINUTES_IN_DAY = HOURS_IN_DAY * MINUTES_IN_HOUR;
const NOTHING_MOVED: SchedulerShift = { days: 0, minutes: 0 };

type Measure = {
  slot: SchedulerSlotData;
  columnWidth: number;
  quarter: number;
  rtl: boolean;
};

type Grab = Measure & { shift: SchedulerShift };

const startMinutesOf = (segment: SchedulerSegment) =>
  Math.round(segment.startHour * MINUTES_IN_HOUR);

function within({ slot }: Measure, { days, minutes }: SchedulerShift): SchedulerShift {
  const start = startMinutesOf(slot.segment);
  return {
    days: clamp(days, -slot.dayIndex, slot.dayCount - 1 - slot.dayIndex),
    minutes: clamp(minutes, -start, MINUTES_IN_DAY - SNAP_MINUTES - start),
  };
}

const offsetOf = ({ columnWidth, quarter, rtl }: Measure, { days, minutes }: SchedulerShift) => ({
  x: days * columnWidth * (rtl ? -1 : 1),
  y: (minutes / SNAP_MINUTES) * quarter,
});

const shiftOf = (measure: Measure, { x, y }: { x: number; y: number }) =>
  within(measure, {
    days: Math.round(((measure.rtl ? -1 : 1) * x) / measure.columnWidth),
    minutes: Math.round(y / measure.quarter) * SNAP_MINUTES,
  });

function measureSlot(slot: SchedulerSlotData, element: HTMLElement, hourHeight: number): Measure {
  const column = element.closest<HTMLElement>('[data-scheduler-column]') ?? element;
  return {
    slot,
    columnWidth: column.offsetWidth,
    quarter: (hourHeight * SNAP_MINUTES) / MINUTES_IN_HOUR,
    rtl: isRightToLeft(element),
  };
}

function focusTheEvent(body: HTMLElement | null, id: string) {
  const slot = body?.querySelector(`[data-scheduler-slot="${CSS.escape(id)}"]`);
  slot
    ?.querySelector<HTMLElement>('[data-surface-trigger], [data-scheduler-event][tabindex]')
    ?.focus();
}

export type SchedulerDragProps = {
  events: readonly SchedulerEventData[];
  format: SchedulerFormat;
  hourHeight: number | undefined;
  bodyRef: RefObject<HTMLElement | null>;
  onEventChange: (event: SchedulerEventData, change: SchedulerEventChange) => void;
  children: ReactNode;
};

export function SchedulerDrag({
  events,
  format,
  hourHeight,
  bodyRef,
  onEventChange,
  children,
}: SchedulerDragProps) {
  const t = useTranslate();
  const pointer = useRef<Measure | null>(null);
  const pendingFocus = useRef<string | null>(null);
  const [grab, setGrab] = useState<Grab | null>(null);
  const [announcement, setAnnouncement] = useState('');

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: POINTER_TRAVEL_BEFORE_DRAG } }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: TOUCH_HOLD_BEFORE_DRAG,
        tolerance: TOUCH_TRAVEL_ALLOWED_WHILE_HOLDING,
      },
    }),
  );

  useEffect(() => {
    const id = pendingFocus.current;
    if (id === null) return;
    pendingFocus.current = null;
    focusTheEvent(bodyRef.current, id);
  }, [events, bodyRef]);

  const move = ({ segment }: SchedulerSlotData, shift: SchedulerShift) => {
    const { event } = segment;
    onEventChange(event, {
      start: shiftedBy(event.start, shift),
      end: shiftedBy(event.end, shift),
    });
  };

  const startOf = ({ slot }: Measure, shift: SchedulerShift) =>
    toCalendarDateTime(slot.day.add({ days: shift.days })).add({
      minutes: startMinutesOf(slot.segment) + shift.minutes,
    });

  const titleOf = (slot: SchedulerSlotData | undefined) => slot?.segment.event.title ?? '';

  const slotOf = ({ active }: Pick<DragStartEvent, 'active'>) =>
    active.data.current as SchedulerSlotData | undefined;

  const snapToTheGrid: Modifier = ({ transform }) => {
    const measure = pointer.current;
    if (!measure) return transform;
    return { ...transform, ...offsetOf(measure, shiftOf(measure, transform)) };
  };

  const announcements: Announcements = {
    onDragStart: (event) => t('scheduler.drag.start', { event: titleOf(slotOf(event)) }),
    onDragOver: () => undefined,
    onDragEnd: (event) => t('scheduler.drag.end', { event: titleOf(slotOf(event)) }),
    onDragCancel: (event) => t('scheduler.drag.cancel', { event: titleOf(slotOf(event)) }),
  };

  const endGrab = (message: string) => {
    setGrab(null);
    setAnnouncement(message);
  };

  const value: SchedulerDragValue = {
    hourHeight,
    grabbed: grab && { key: grab.slot.key, offset: offsetOf(grab, grab.shift) },
    grab: (slot, element) => {
      if (hourHeight === undefined) return;
      setGrab({ ...measureSlot(slot, element, hourHeight), shift: NOTHING_MOVED });
      setAnnouncement(t('scheduler.drag.start', { event: titleOf(slot) }));
    },
    nudge: (by) => {
      if (!grab) return;
      const shift = within(grab, {
        days: grab.shift.days + by.days,
        minutes: grab.shift.minutes + by.minutes,
      });
      setGrab({ ...grab, shift });
      setAnnouncement(t('scheduler.drag.at', { time: format.moment(startOf(grab, shift)) }));
    },
    drop: () => {
      if (!grab) return;
      const moved = isShifted(grab.shift);
      endGrab(
        t(moved ? 'scheduler.drag.end' : 'scheduler.drag.cancel', { event: titleOf(grab.slot) }),
      );
      if (!moved) return;
      pendingFocus.current = grab.slot.segment.event.id;
      move(grab.slot, grab.shift);
    },
    cancel: () => {
      if (grab) endGrab(t('scheduler.drag.cancel', { event: titleOf(grab.slot) }));
    },
    resize: (segment, height) => {
      if (hourHeight === undefined || Math.abs(height - segment.hours * hourHeight) < 0.5) return;
      const minutes =
        snappedMinutes(segment.startHour + height / hourHeight) -
        Math.round(segment.endHour * MINUTES_IN_HOUR);
      if (minutes === 0) return;
      const { event } = segment;
      onEventChange(event, { start: event.start, end: shiftedBy(event.end, { days: 0, minutes }) });
    },
    endLabel: (segment, day, height) =>
      format.time(
        toCalendarDateTime(day).add({
          minutes: snappedMinutes(segment.startHour + height / (hourHeight ?? 1)),
        }),
      ),
  };

  return (
    <SchedulerDragContext value={value}>
      <DndContext
        sensors={sensors}
        modifiers={[snapToTheGrid]}
        accessibility={{
          announcements,
          screenReaderInstructions: { draggable: t('scheduler.drag.hint') },
        }}
        onDragStart={(event) => {
          const slot = slotOf(event);
          const element = slot?.element();
          value.cancel();
          pointer.current =
            slot && element && hourHeight !== undefined
              ? measureSlot(slot, element, hourHeight)
              : null;
        }}
        onDragEnd={({ delta }) => {
          const measure = pointer.current;
          pointer.current = null;
          swallowTheClickThatEndsADrag();
          if (!measure) return;
          const shift = shiftOf(measure, delta);
          if (isShifted(shift)) move(measure.slot, shift);
        }}
        onDragCancel={() => {
          pointer.current = null;
        }}
      >
        {children}
      </DndContext>
      <span aria-live="assertive" className="sr-only">
        {announcement}
      </span>
    </SchedulerDragContext>
  );
}
