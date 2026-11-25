import {
  type CalendarDate,
  CalendarDateTime,
  endOfMonth,
  startOfMonth,
  toCalendarDate,
  toCalendarDateTime,
  type DateValue,
} from '@internationalized/date';
import { clamp } from 'es-toolkit';

import { compareDays, ownDate, weekdayOf } from '../../calendar/lib/date';

import type { WeekDay } from '../../../../internal/date-locale';

export type SchedulerView = 'month' | 'week' | 'days' | 'day';

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
  endHour: number;
  endsHere: boolean;
  left: number;
  width: number;
};

export type SchedulerEventChange<E extends SchedulerEventData = SchedulerEventData> = Pick<
  E,
  'start' | 'end'
>;

export type SchedulerShift = { days: number; minutes: number };

export type SchedulerSlot = { start: CalendarDateTime; end: CalendarDateTime; allDay: boolean };

export type SchedulerAllDayBar<E extends SchedulerEventData = SchedulerEventData> = {
  event: E;
  column: number;
  span: number;
  row: number;
  fromBefore: boolean;
  pastEnd: boolean;
};

export type SchedulerMonthBar<E extends SchedulerEventData = SchedulerEventData> =
  SchedulerAllDayBar<E> & {
    start: CalendarDateTime;
    end: CalendarDateTime;
    allDay: boolean;
    multiDay: boolean;
  };

const DAYS_IN_WEEK = 7;
const MINUTES_IN_HOUR = 60;
export const HOURS_IN_DAY = 24;
export const SNAP_MINUTES = 15;
export const SHORTEST_SHOWN_HOURS = 0.5;

const wallTime = (value: DateValue) => {
  const time = toCalendarDateTime(value);
  return new CalendarDateTime(time.year, time.month, time.day, time.hour, time.minute);
};

export const dateOf = (value: DateValue) => ownDate(toCalendarDate(value));

export const isAllDay = (event: SchedulerEventData) => event.allDay ?? !('hour' in event.start);

export const DEFAULT_DAY_COUNT = 3;
export const FEWEST_DAYS = 2;
export const MOST_DAYS = 14;

export const shownDayCount = (count: number) =>
  Number.isFinite(count) ? clamp(Math.round(count), FEWEST_DAYS, MOST_DAYS) : DEFAULT_DAY_COUNT;

export const isDayCount = (count: number | null): count is number =>
  count !== null && Number.isInteger(count) && count >= FEWEST_DAYS && count <= MOST_DAYS;

const daysFrom = (first: CalendarDate, count: number) =>
  Array.from({ length: count }, (_, index) => first.add({ days: index }));

const weekStartOn = (day: CalendarDate, weekStart: WeekDay) =>
  day.subtract({ days: (weekdayOf(day) - weekStart + DAYS_IN_WEEK) % DAYS_IN_WEEK });

export function daysOf(
  view: SchedulerView,
  date: CalendarDate,
  weekStart: WeekDay,
  dayCount = DEFAULT_DAY_COUNT,
) {
  const anchor = ownDate(date);
  if (view === 'day') return [anchor];
  if (view === 'days') return daysFrom(anchor, dayCount);
  if (view === 'week') return daysFrom(weekStartOn(anchor, weekStart), DAYS_IN_WEEK);

  const first = weekStartOn(startOfMonth(anchor), weekStart);
  const last = endOfMonth(anchor);
  const weeks = Math.ceil((compareDays(last, first) + 1) / DAYS_IN_WEEK);
  return daysFrom(first, weeks * DAYS_IN_WEEK);
}

export const weeksIn = (days: CalendarDate[]) =>
  Array.from({ length: days.length / DAYS_IN_WEEK }, (_, week) =>
    days.slice(week * DAYS_IN_WEEK, (week + 1) * DAYS_IN_WEEK),
  );

export function stepOf(view: SchedulerView, dayCount = DEFAULT_DAY_COUNT) {
  if (view === 'month') return { months: 1 };
  if (view === 'week') return { weeks: 1 };
  if (view === 'days') return { days: dayCount };
  return { days: 1 };
}

export const hourOfDay = (time: CalendarDateTime) => time.hour + time.minute / MINUTES_IN_HOUR;

export function allDayBarsIn<E extends SchedulerEventData>(
  events: readonly E[],
  days: CalendarDate[],
): SchedulerAllDayBar<E>[] {
  const first = days[0];
  const last = days[days.length - 1];
  const columnOf = (day: CalendarDate) =>
    Math.min(Math.max(compareDays(day, first), 0), days.length - 1);

  const bars = events
    .filter(
      (event) =>
        isAllDay(event) &&
        compareDays(dateOf(event.start), last) <= 0 &&
        compareDays(lastDayOf(event), first) >= 0,
    )
    .map((event) => {
      const column = columnOf(dateOf(event.start));
      const lastDay = lastDayOf(event);
      return {
        event,
        column,
        span: columnOf(lastDay) - column + 1,
        row: 0,
        fromBefore: compareDays(dateOf(event.start), first) < 0,
        pastEnd: compareDays(lastDay, last) > 0,
      };
    })
    .sort((a, b) => a.column - b.column || b.span - a.span);

  return packedIntoRows(bars);
}

function packedIntoRows<B extends { column: number; span: number; row: number }>(bars: B[]) {
  const rowEnds: number[] = [];
  for (const bar of bars) {
    const freeRow = rowEnds.findIndex((rowEnd) => rowEnd < bar.column);
    bar.row = freeRow === -1 ? rowEnds.length : freeRow;
    rowEnds[bar.row] = bar.column + bar.span - 1;
  }
  return bars;
}

export function lastDayBefore(start: CalendarDate, end: CalendarDate) {
  const last = end.subtract({ days: 1 });
  return compareDays(last, start) < 0 ? start : last;
}

function lastDayOf(event: SchedulerEventData) {
  if (isAllDay(event)) return lastDayBefore(dateOf(event.start), dateOf(event.end));
  const start = wallTime(event.start);
  const end = wallTime(event.end);
  const endsAtMidnight = end.hour === 0 && end.minute === 0 && end.compare(start) > 0;
  const last = dateOf(endsAtMidnight ? end.subtract({ days: 1 }) : end);
  return compareDays(last, dateOf(start)) < 0 ? dateOf(start) : last;
}

export function monthBarsIn<E extends SchedulerEventData>(
  events: readonly E[],
  week: CalendarDate[],
): SchedulerMonthBar<E>[] {
  const first = week[0];
  const last = week[week.length - 1];
  const columnOf = (day: CalendarDate) =>
    Math.min(Math.max(compareDays(day, first), 0), week.length - 1);

  const bars = events
    .filter(
      (event) =>
        compareDays(dateOf(event.start), last) <= 0 && compareDays(lastDayOf(event), first) >= 0,
    )
    .map((event) => {
      const column = columnOf(dateOf(event.start));
      const allDay = isAllDay(event);
      const lastDay = lastDayOf(event);
      return {
        event,
        column,
        span: columnOf(lastDay) - column + 1,
        row: 0,
        fromBefore: compareDays(dateOf(event.start), first) < 0,
        pastEnd: compareDays(lastDay, last) > 0,
        allDay,
        multiDay: compareDays(lastDay, dateOf(event.start)) > 0,
        start: allDay ? toCalendarDateTime(dateOf(event.start)) : wallTime(event.start),
        end: allDay ? toCalendarDateTime(dateOf(event.end)) : wallTime(event.end),
      };
    })
    .sort(
      (a, b) =>
        a.column - b.column ||
        b.span - a.span ||
        Number(b.allDay || b.multiDay) - Number(a.allDay || a.multiDay) ||
        a.start.compare(b.start),
    );

  return packedIntoRows(bars);
}

export function hiddenOn<E extends SchedulerEventData>(
  bars: SchedulerMonthBar<E>[],
  column: number,
  shownRows: number,
) {
  return bars.filter(
    (bar) => bar.row >= shownRows && bar.column <= column && column < bar.column + bar.span,
  ).length;
}

type UnplacedSegment<E extends SchedulerEventData> = Omit<SchedulerSegment<E>, 'left' | 'width'>;

function segmentOn<E extends SchedulerEventData>(
  event: E,
  day: CalendarDate,
): UnplacedSegment<E> | null {
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
  const endsHere = instant || end.compare(dayEnd) <= 0;
  return { event, start, end, startHour, hours, endHour, endsHere };
}

export const shiftedBy = (value: DateValue, { days, minutes }: SchedulerShift): DateValue =>
  'hour' in value ? value.add({ days, minutes }) : value.add({ days });

export const isShifted = ({ days, minutes }: SchedulerShift) => days !== 0 || minutes !== 0;

export const snappedMinutes = (hours: number) =>
  Math.round((hours * MINUTES_IN_HOUR) / SNAP_MINUTES) * SNAP_MINUTES;

const MINUTES_IN_DAY = HOURS_IN_DAY * MINUTES_IN_HOUR;

export function snappedRange(from: number, to: number) {
  const first = clamp(
    Math.floor(Math.min(from, to) / SNAP_MINUTES) * SNAP_MINUTES,
    0,
    MINUTES_IN_DAY - SNAP_MINUTES,
  );
  const last = clamp(
    Math.ceil(Math.max(from, to) / SNAP_MINUTES) * SNAP_MINUTES,
    first + SNAP_MINUTES,
    MINUTES_IN_DAY,
  );
  return { first, last };
}

export function timesBetween(day: CalendarDate, from: number, to: number): SchedulerSlot {
  const { first, last } = snappedRange(from, to);
  const midnight = toCalendarDateTime(day);
  return {
    start: midnight.add({ minutes: first }),
    end: midnight.add({ minutes: last }),
    allDay: false,
  };
}

export function daysBetween(from: CalendarDate, to: CalendarDate): SchedulerSlot {
  const [first, last] = compareDays(from, to) <= 0 ? [from, to] : [to, from];
  return {
    start: toCalendarDateTime(first),
    end: toCalendarDateTime(last.add({ days: 1 })),
    allDay: true,
  };
}

type Columned<E extends SchedulerEventData> = UnplacedSegment<E> & { column: number };

const byStartThenLongest = (
  a: UnplacedSegment<SchedulerEventData>,
  b: UnplacedSegment<SchedulerEventData>,
) => a.startHour - b.startHour || b.hours - a.hours;

const endHourOf = (segment: UnplacedSegment<SchedulerEventData>) =>
  segment.startHour + segment.hours;

const overlap = (a: UnplacedSegment<SchedulerEventData>, b: UnplacedSegment<SchedulerEventData>) =>
  a.startHour < endHourOf(b) && b.startHour < endHourOf(a);

function firstFreeColumn<E extends SchedulerEventData>(
  cluster: Columned<E>[],
  segment: UnplacedSegment<E>,
) {
  let column = 0;
  while (cluster.some((member) => member.column === column && overlap(member, segment))) column++;
  return column;
}

function spreadAcross<E extends SchedulerEventData>(cluster: Columned<E>[]): SchedulerSegment<E>[] {
  const columns = Math.max(...cluster.map((member) => member.column)) + 1;
  const freeIn = (column: number, member: Columned<E>) =>
    !cluster.some((other) => other.column === column && overlap(other, member));

  return cluster.map(({ column, ...segment }) => {
    let reach = column + 1;
    while (reach < columns && freeIn(reach, { column, ...segment })) reach++;
    return { ...segment, left: column / columns, width: (reach - column) / columns };
  });
}

export function timedSegmentsOn<E extends SchedulerEventData>(
  events: readonly E[],
  day: CalendarDate,
): SchedulerSegment<E>[] {
  const segments = events
    .filter((event) => !isAllDay(event))
    .flatMap((event) => segmentOn(event, day) ?? [])
    .sort(byStartThenLongest);

  const placed: SchedulerSegment<E>[] = [];
  let cluster: Columned<E>[] = [];
  let clusterEnd = -Infinity;
  for (const segment of segments) {
    if (segment.startHour >= clusterEnd) {
      placed.push(...spreadAcross(cluster));
      cluster = [];
    }
    cluster.push({ ...segment, column: firstFreeColumn(cluster, segment) });
    clusterEnd = Math.max(clusterEnd, endHourOf(segment));
  }
  return [...placed, ...spreadAcross(cluster)];
}

export function firstHourOf(events: readonly SchedulerEventData[], days: CalendarDate[]) {
  const starts = days.flatMap((day) =>
    timedSegmentsOn(events, day)
      .filter((segment) => compareDays(dateOf(segment.start), day) === 0)
      .map((segment) => segment.startHour),
  );
  return starts.length ? Math.floor(Math.min(...starts)) : undefined;
}
