import { clamp } from 'es-toolkit';

import { HOURS_IN_DAY, SNAP_MINUTES, type SchedulerShift } from './layout';
import { isRightToLeft } from '../../../internal/resize-handle';

import type { SchedulerDragPiece, SchedulerSlotData } from './context';

const MINUTES_IN_HOUR = 60;
const MINUTES_IN_DAY = HOURS_IN_DAY * MINUTES_IN_HOUR;
const DAYS_IN_WEEK = 7;

type Travel = { x: number; y: number };

export type SchedulerDragMeasure = {
  piece: SchedulerDragPiece;
  within: (shift: SchedulerShift) => SchedulerShift;
  shiftOf: (travel: Travel) => SchedulerShift;
  offsetOf: (shift: SchedulerShift) => Travel;
};

const daysWithin = ({ dayIndex, dayCount }: SchedulerDragPiece, days: number) =>
  clamp(days, -dayIndex, dayCount - 1 - dayIndex);

export function measureInTheGrid(
  slot: SchedulerSlotData,
  element: HTMLElement,
  hourHeight: number,
): SchedulerDragMeasure {
  const column = element.closest<HTMLElement>('[data-scheduler-column]') ?? element;
  const columnWidth = column.offsetWidth;
  const quarter = (hourHeight * SNAP_MINUTES) / MINUTES_IN_HOUR;
  const forward = isRightToLeft(element) ? -1 : 1;
  const start = Math.round(slot.segment.startHour * MINUTES_IN_HOUR);

  const within = ({ days, minutes }: SchedulerShift) => ({
    days: daysWithin(slot, days),
    minutes: clamp(minutes, -start, MINUTES_IN_DAY - SNAP_MINUTES - start),
  });

  return {
    piece: slot,
    within,
    shiftOf: ({ x, y }) =>
      within({
        days: Math.round((forward * x) / columnWidth),
        minutes: Math.round(y / quarter) * SNAP_MINUTES,
      }),
    offsetOf: ({ days, minutes }) => ({
      x: days * columnWidth * forward,
      y: (minutes / SNAP_MINUTES) * quarter,
    }),
  };
}

export function measureInTheMonth(
  piece: SchedulerDragPiece,
  element: HTMLElement,
): SchedulerDragMeasure {
  const week = element.closest<HTMLElement>('[data-scheduler-month-week]') ?? element;
  const columnWidth = week.offsetWidth / DAYS_IN_WEEK;
  const rowHeight = week.offsetHeight;
  const forward = isRightToLeft(element) ? -1 : 1;
  const column = piece.dayIndex % DAYS_IN_WEEK;
  const row = Math.floor(piece.dayIndex / DAYS_IN_WEEK);

  const within = ({ days }: SchedulerShift) => ({ days: daysWithin(piece, days), minutes: 0 });

  return {
    piece,
    within,
    shiftOf: ({ x, y }) => {
      const columns =
        clamp(column + Math.round((forward * x) / columnWidth), 0, DAYS_IN_WEEK - 1) - column;
      return within({ days: columns + Math.round(y / rowHeight) * DAYS_IN_WEEK, minutes: 0 });
    },
    offsetOf: ({ days }) => {
      const target = piece.dayIndex + days;
      return {
        x: ((target % DAYS_IN_WEEK) - column) * columnWidth * forward,
        y: (Math.floor(target / DAYS_IN_WEEK) - row) * rowHeight,
      };
    },
  };
}
