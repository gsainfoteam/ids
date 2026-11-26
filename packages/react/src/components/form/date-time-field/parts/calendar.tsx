'use client';

import { Time, type CalendarDate, type CalendarDateTime } from '@internationalized/date';

import { useInternalTemporalPicker } from '../../../../internal/temporal-field';
import { Calendar, useCalendar } from '../../../data/calendar';
import { useInternalDateTimeFieldContext } from '../context';
import { dayOf, dayUnavailable, onDay, timeOfDay } from '../lib/date-time';

import type { FieldCalendarOptions } from '../../../data/calendar/hooks/use-calendar';

export type DateTimeFieldCalendarProps = Omit<
  Calendar.Props,
  | 'selectionMode'
  | 'value'
  | 'defaultValue'
  | 'onValueChange'
  | 'calendar'
  | 'disabled'
  | 'readOnly'
  | 'size'
  | 'autoFocus'
  | 'aria-label'
  | 'aria-labelledby'
> &
  FieldCalendarOptions;

const MIDNIGHT = new Time();

export function DateTimeFieldCalendar({
  monthsToShow,
  today,
  month,
  defaultMonth,
  onMonthChange,
  ...props
}: DateTimeFieldCalendarProps) {
  const field = useInternalDateTimeFieldContext('DateTimeField.Calendar');
  const picker = useInternalTemporalPicker<CalendarDateTime | null>('DateTimeField.Calendar');
  const { limits } = field;
  const calendar = useCalendar({
    availability: {
      min: limits.min && dayOf(limits.min),
      max: limits.max && dayOf(limits.max),
      unavailable: (candidate) => dayUnavailable(candidate, limits),
    },
    display: { monthsToShow, today: today ?? field.today },
    month: { value: month, defaultValue: defaultMonth, onValueChange: onMonthChange },
  });
  const clock = picker.value ? timeOfDay(picker.value) : MIDNIGHT;

  const pickDay = (next: CalendarDate | null) => {
    const moved = next && onDay(next, clock, limits);
    if (moved) picker.change(moved);
  };

  return (
    <Calendar
      {...picker.name}
      {...props}
      value={picker.value && dayOf(picker.value)}
      onValueChange={pickDay}
      calendar={calendar}
      size={picker.size}
    />
  );
}

DateTimeFieldCalendar.displayName = 'DateTimeField.Calendar';
