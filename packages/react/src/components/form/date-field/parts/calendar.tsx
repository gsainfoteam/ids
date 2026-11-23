'use client';

import { useInternalTemporalPicker } from '../../../../internal/temporal-field';
import { Calendar, CalendarPickContext } from '../../../data/calendar';
import { useInternalDateFieldContext } from '../context';

import type { CalendarValue } from '../../../data/calendar/lib/date';

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
  const field = useInternalDateFieldContext('DateField.Calendar');
  const picker = useInternalTemporalPicker<CalendarValue>('DateField.Calendar');
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
