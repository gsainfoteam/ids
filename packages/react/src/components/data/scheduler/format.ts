import { memoize } from 'es-toolkit';

import { dateFormatter, numberFormatter } from '../../../internal/date-locale';

import type { SchedulerView } from './layout';
import type { CalendarDate, CalendarDateTime } from '@internationalized/date';

const WALL_CLOCK = 'UTC';
const SAMPLE_YEAR = 2000;

const onTheWall = (value: CalendarDate | CalendarDateTime) => value.toDate(WALL_CLOCK);

export const schedulerFormat = memoize((locale: string) => {
  const weekday = dateFormatter(locale, { weekday: 'short', timeZone: WALL_CLOCK });
  const fullDate = dateFormatter(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    timeZone: WALL_CLOCK,
  });
  const rangeDate = dateFormatter(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: WALL_CLOCK,
  });
  const dayDate = dateFormatter(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    timeZone: WALL_CLOCK,
  });
  const time = dateFormatter(locale, { hour: 'numeric', minute: '2-digit', timeZone: WALL_CLOCK });
  const hour = dateFormatter(locale, { hour: 'numeric', timeZone: WALL_CLOCK });
  const moment = dateFormatter(locale, {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: WALL_CLOCK,
  });
  const digits = numberFormatter(locale, { useGrouping: false });

  return {
    weekday: (day: CalendarDate) => weekday.format(onTheWall(day)),
    dayNumber: (day: CalendarDate) => digits.format(day.day),
    fullDate: (day: CalendarDate) => fullDate.format(onTheWall(day)),
    dates: (from: CalendarDate, to: CalendarDate) =>
      fullDate.formatRange(onTheWall(from), onTheWall(to)),
    time: (value: CalendarDateTime) => time.format(onTheWall(value)),
    moment: (value: CalendarDateTime) => moment.format(onTheWall(value)),
    hour: (value: number) => hour.format(new Date(Date.UTC(SAMPLE_YEAR, 0, 1, value))),
    range: (view: SchedulerView, days: CalendarDate[]) =>
      view === 'day'
        ? dayDate.format(onTheWall(days[0]))
        : rangeDate.formatRange(onTheWall(days[0]), onTheWall(days[days.length - 1])),
  };
});

export type SchedulerFormat = ReturnType<typeof schedulerFormat>;
