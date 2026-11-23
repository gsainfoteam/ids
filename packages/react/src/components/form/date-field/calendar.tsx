'use client';

import { useDateFieldContext } from './context';
import { useTemporalPicker } from '../../../internal/temporal-field';
import { Calendar, CalendarPickContext } from '../../data/calendar';

import type { CalendarValue } from '../../data/calendar/date';

export type DateFieldCalendarProps = Omit<
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
>;

export function DateFieldCalendar(props: DateFieldCalendarProps) {
  const field = useDateFieldContext('DateField.Calendar');
  const picker = useTemporalPicker<CalendarValue>('DateField.Calendar');
  const closeOnPick = field.selectionMode === 'single' ? () => picker.close(true) : null;

  return (
    <CalendarPickContext value={closeOnPick}>
      <Calendar
        {...props}
        {...({
          selectionMode: field.selectionMode,
          value: picker.value,
          onValueChange: picker.change,
        } as Calendar.Props)}
        min={field.min}
        max={field.max}
        disabled={field.disabled === true ? undefined : field.disabled}
        size={picker.size}
      />
    </CalendarPickContext>
  );
}

DateFieldCalendar.displayName = 'DateField.Calendar';
