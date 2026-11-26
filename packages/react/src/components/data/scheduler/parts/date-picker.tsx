'use client';

import { Calendar, useCalendar } from '../../calendar';

import type { CalendarDate } from '@internationalized/date';

type SchedulerDatePickerProps = {
  'aria-label': string;
  date: CalendarDate;
  today: CalendarDate | undefined;
  onPick: (date: CalendarDate) => void;
};

export function SchedulerDatePicker({
  'aria-label': ariaLabel,
  date,
  today,
  onPick,
}: SchedulerDatePickerProps) {
  const calendar = useCalendar({ display: { today }, month: { defaultValue: date } });

  return (
    <Calendar
      aria-label={ariaLabel}
      value={date}
      onValueChange={(picked) => picked && onPick(picked)}
      calendar={calendar}
    />
  );
}
