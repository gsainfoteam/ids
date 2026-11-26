'use client';

import { useInternalTemporalPicker } from '../../../../internal/temporal-field';
import { Calendar, CalendarPickContext, useCalendar } from '../../../data/calendar';
import { useInternalDateFieldContext } from '../context';

import type { FieldCalendarOptions } from '../../../data/calendar/hooks/use-calendar';
import type { CalendarValue, DateSelection } from '../../../data/calendar/lib/date';

export type DateFieldCalendarProps = Omit<
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

export function DateFieldCalendar({
  monthsToShow,
  today,
  month,
  defaultMonth,
  onMonthChange,
  ...props
}: DateFieldCalendarProps) {
  const field = useInternalDateFieldContext('DateField.Calendar');
  const picker = useInternalTemporalPicker<CalendarValue>('DateField.Calendar');
  const calendar = useCalendar({
    availability: {
      min: field.min,
      max: field.max,
      unavailable: field.disabled === true ? undefined : field.disabled,
    },
    display: { monthsToShow, today },
    month: { value: month, defaultValue: defaultMonth, onValueChange: onMonthChange },
  });
  const closeOnPick = field.selectionMode === 'single' ? () => picker.close(true) : null;

  return (
    <CalendarPickContext value={closeOnPick}>
      <Calendar
        {...props}
        {...({
          selectionMode: field.selectionMode,
          value: picker.value,
          onValueChange: picker.change,
        } as DateSelection)}
        {...picker.name}
        calendar={calendar}
        size={picker.size}
      />
    </CalendarPickContext>
  );
}

DateFieldCalendar.displayName = 'DateField.Calendar';
