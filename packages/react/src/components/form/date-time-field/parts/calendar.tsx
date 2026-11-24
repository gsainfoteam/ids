'use client';

import { Time, type CalendarDate, type CalendarDateTime } from '@internationalized/date';

import { useInternalTemporalPicker } from '../../../../internal/temporal-field';
import { Calendar } from '../../../data/calendar';
import { useInternalDateTimeFieldContext } from '../context';
import { dayOf, dayUnavailable, onDay, timeOfDay } from '../lib/date-time';

export type DateTimeFieldCalendarProps = Omit<
  Calendar.Props,
  | 'selectionMode'
  | 'value'
  | 'defaultValue'
  | 'onValueChange'
  | 'min'
  | 'max'
  | 'disabled'
  | 'readOnly'
  | 'size'
  | 'autoFocus'
  | 'aria-label'
  | 'aria-labelledby'
>;

const MIDNIGHT = new Time();

export function DateTimeFieldCalendar(props: DateTimeFieldCalendarProps) {
  const field = useInternalDateTimeFieldContext('DateTimeField.Calendar');
  const picker = useInternalTemporalPicker<CalendarDateTime | null>('DateTimeField.Calendar');
  const { limits } = field;
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
      min={limits.min && dayOf(limits.min)}
      max={limits.max && dayOf(limits.max)}
      disabled={(candidate) => dayUnavailable(candidate, limits)}
      today={field.today}
      size={picker.size}
    />
  );
}

DateTimeFieldCalendar.displayName = 'DateTimeField.Calendar';
