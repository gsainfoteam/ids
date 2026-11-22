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

export type SchedulerAllDayBar<E extends SchedulerEventData = SchedulerEventData> = {
  event: E;
  column: number;
  span: number;
  row: number;
};

const DAYS_IN_WEEK = 7;
const MINUTES_IN_HOUR = 60;
export const HOURS_IN_DAY = 24;
export const SNAP_MINUTES = 15;
export const SHORTEST_SHOWN_HOURS = 0.5;
const SIDE_BY_SIDE_WITHIN_HOURS = 0.5;
const STACK_INDENT = 0.15;
const DEEPEST_STACK_INDENT = 0.45;

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
        compareDays(dateOf(event.end), first) >= 0,
    )
    .map((event) => {
      const column = columnOf(dateOf(event.start));
      return { event, column, span: columnOf(dateOf(event.end)) - column + 1, row: 0 };
    })
    .sort((a, b) => a.column - b.column || b.span - a.span);

  const rowEnds: number[] = [];
  for (const bar of bars) {
    const freeRow = rowEnds.findIndex((rowEnd) => rowEnd < bar.column);
    bar.row = freeRow === -1 ? rowEnds.length : freeRow;
    rowEnds[bar.row] = bar.column + bar.span - 1;
  }
  return bars;
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

type SideBySide<E extends SchedulerEventData> = {
  indent: number;
  members: UnplacedSegment<E>[];
};

const byStartThenLongest = (
  a: UnplacedSegment<SchedulerEventData>,
  b: UnplacedSegment<SchedulerEventData>,
) => a.startHour - b.startHour || b.hours - a.hours;

const overlap = (a: UnplacedSegment<SchedulerEventData>, b: UnplacedSegment<SchedulerEventData>) =>
  a.startHour < b.startHour + b.hours && b.startHour < a.startHour + a.hours;

export function timedSegmentsOn<E extends SchedulerEventData>(
  events: readonly E[],
  day: CalendarDate,
): SchedulerSegment<E>[] {
  const segments = events
    .filter((event) => !isAllDay(event))
    .flatMap((event) => segmentOn(event, day) ?? [])
    .sort(byStartThenLongest);

  const sideBySideOf = new Map<UnplacedSegment<E>, SideBySide<E>>();
  for (const segment of segments) {
    const earlier = [...sideBySideOf.keys()].filter((placed) => overlap(placed, segment));
    const startsWith = earlier
      .filter((placed) => segment.startHour - placed.startHour < SIDE_BY_SIDE_WITHIN_HOURS)
      .at(-1);
    if (startsWith) {
      const sideBySide = sideBySideOf.get(startsWith)!;
      sideBySide.members.push(segment);
      sideBySideOf.set(segment, sideBySide);
      continue;
    }

    const coveredIndent = Math.max(
      -1,
      ...earlier.map((placed) => sideBySideOf.get(placed)!.indent),
    );
    sideBySideOf.set(segment, { indent: coveredIndent + 1, members: [segment] });
  }

  return segments.map((segment) => {
    const { indent, members } = sideBySideOf.get(segment)!;
    const inset = Math.min(indent * STACK_INDENT, DEEPEST_STACK_INDENT);
    const width = (1 - inset) / members.length;
    return { ...segment, left: inset + members.indexOf(segment) * width, width };
  });
}

export function firstHourOf(events: readonly SchedulerEventData[], days: CalendarDate[]) {
  const starts = days.flatMap((day) =>
    timedSegmentsOn(events, day)
      .filter((segment) => compareDays(dateOf(segment.start), day) === 0)
      .map((segment) => segment.startHour),
  );
  return starts.length ? Math.floor(Math.min(...starts)) : undefined;
}
