import {
  type CalendarDate,
  CalendarDateTime,
  toCalendarDate,
  toCalendarDateTime,
  type DateValue,
} from '@internationalized/date';

import { compareDays, ownDate, weekdayOf } from '../calendar/date';

import type { WeekDay } from '../../../internal/date-locale';

export type SchedulerView = 'week' | 'day';

export type SchedulerColorScheme =
  | 'neutral'
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

export type SchedulerEventData = {
  id: string;
  title: string;
  start: DateValue;
  end: DateValue;
  allDay?: boolean;
  colorScheme?: SchedulerColorScheme;
};

export type SchedulerSegment<E extends SchedulerEventData = SchedulerEventData> = {
  event: E;
  start: CalendarDateTime;
  end: CalendarDateTime;
  startHour: number;
  hours: number;
  lane: number;
  lanes: number;
};

const DAYS_IN_WEEK = 7;
const MINUTES_IN_HOUR = 60;
const HOURS_IN_DAY = 24;
const SHORTEST_SHOWN_HOURS = 0.5;

const wallTime = (value: DateValue) => {
  const time = toCalendarDateTime(value);
  return new CalendarDateTime(time.year, time.month, time.day, time.hour, time.minute);
};

export const dateOf = (value: DateValue) => ownDate(toCalendarDate(value));

export const isAllDay = (event: SchedulerEventData) => event.allDay ?? !('hour' in event.start);

export function daysOf(view: SchedulerView, date: CalendarDate, weekStart: WeekDay) {
  const anchor = ownDate(date);
  if (view === 'day') return [anchor];

  const sinceWeekStart = (weekdayOf(anchor) - weekStart + DAYS_IN_WEEK) % DAYS_IN_WEEK;
  const first = anchor.subtract({ days: sinceWeekStart });
  return Array.from({ length: DAYS_IN_WEEK }, (_, index) => first.add({ days: index }));
}

export const stepOf = (view: SchedulerView) => (view === 'week' ? { weeks: 1 } : { days: 1 });

export const hourOfDay = (time: CalendarDateTime) => time.hour + time.minute / MINUTES_IN_HOUR;

export function allDayEventsOn<E extends SchedulerEventData>(
  events: readonly E[],
  day: CalendarDate,
) {
  return events.filter(
    (event) =>
      isAllDay(event) &&
      compareDays(dateOf(event.start), day) <= 0 &&
      compareDays(day, dateOf(event.end)) <= 0,
  );
}

function segmentOn<E extends SchedulerEventData>(
  event: E,
  day: CalendarDate,
): Omit<SchedulerSegment<E>, 'lane' | 'lanes'> | null {
  const dayStart = toCalendarDateTime(day);
  const dayEnd = dayStart.add({ days: 1 });
  const start = wallTime(event.start);
  const end = wallTime(event.end);
  const instant = end.compare(start) <= 0;
  const touchesDay = instant
    ? start.compare(dayStart) >= 0 && start.compare(dayEnd) < 0
    : start.compare(dayEnd) < 0 && end.compare(dayStart) > 0;
  if (!touchesDay) return null;

  const shownStart = start.compare(dayStart) < 0 ? dayStart : start;
  const shownEnd = instant ? shownStart : end.compare(dayEnd) > 0 ? dayEnd : end;
  const startHour = hourOfDay(shownStart);
  const endHour = shownEnd.compare(dayEnd) === 0 ? HOURS_IN_DAY : hourOfDay(shownEnd);
  const hours = Math.min(
    Math.max(endHour - startHour, SHORTEST_SHOWN_HOURS),
    HOURS_IN_DAY - startHour,
  );
  return { event, start, end, startHour, hours };
}

const byStartThenLongest = (
  a: Omit<SchedulerSegment, 'lane' | 'lanes'>,
  b: Omit<SchedulerSegment, 'lane' | 'lanes'>,
) => a.startHour - b.startHour || b.hours - a.hours;

export function timedSegmentsOn<E extends SchedulerEventData>(
  events: readonly E[],
  day: CalendarDate,
): SchedulerSegment<E>[] {
  const segments = events
    .filter((event) => !isAllDay(event))
    .flatMap((event) => segmentOn(event, day) ?? [])
    .sort(byStartThenLongest);

  const placed: SchedulerSegment<E>[] = [];
  let cluster: SchedulerSegment<E>[] = [];
  let laneEnds: number[] = [];
  let clusterEnd = -Infinity;

  const closeCluster = () => {
    for (const segment of cluster) segment.lanes = laneEnds.length;
    cluster = [];
    laneEnds = [];
  };

  for (const segment of segments) {
    const overlapsNothingBefore = segment.startHour >= clusterEnd;
    if (overlapsNothingBefore) {
      closeCluster();
      clusterEnd = -Infinity;
    }

    const segmentEnd = segment.startHour + segment.hours;
    const freeLane = laneEnds.findIndex((laneEnd) => laneEnd <= segment.startHour);
    const lane = freeLane === -1 ? laneEnds.length : freeLane;
    laneEnds[lane] = segmentEnd;
    clusterEnd = Math.max(clusterEnd, segmentEnd);
    const laid = { ...segment, lane, lanes: 1 };
    cluster.push(laid);
    placed.push(laid);
  }
  closeCluster();

  return placed;
}

export function firstHourOf(events: readonly SchedulerEventData[], days: CalendarDate[]) {
  const starts = days.flatMap((day) =>
    timedSegmentsOn(events, day)
      .filter((segment) => compareDays(dateOf(segment.start), day) === 0)
      .map((segment) => segment.startHour),
  );
  return starts.length ? Math.floor(Math.min(...starts)) : undefined;
}
