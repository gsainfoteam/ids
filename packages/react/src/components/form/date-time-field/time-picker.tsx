'use client';

import { type CalendarDateTime, type Time } from '@internationalized/date';

import { useDateTimeFieldContext } from './context';
import { atSeconds, dayBounds, dayOf, dayUnavailable, timeOfDay, withinLimits } from './date-time';
import { useTemporalPicker } from '../../../internal/temporal-field';
import { cn } from '../../../utils';
import { TimePicker } from '../../data/time-picker';
import { secondsOf } from '../../data/time-picker/time';

export type DateTimeFieldTimePickerProps = Omit<
  TimePicker.Props,
  | 'value'
  | 'defaultValue'
  | 'onValueChange'
  | 'precision'
  | 'hourCycle'
  | 'step'
  | 'min'
  | 'max'
  | 'size'
  | 'disabled'
  | 'readOnly'
  | 'className'
> & { className?: string };

export function DateTimeFieldTimePicker({ className, ...props }: DateTimeFieldTimePickerProps) {
  const field = useDateTimeFieldContext('DateTimeField.TimePicker');
  const picker = useTemporalPicker<CalendarDateTime | null>('DateTimeField.TimePicker');
  const { limits } = field;
  const day = picker.value ? dayOf(picker.value) : field.today;
  const bounds = dayBounds(day, limits.min, limits.max);

  const pickTime = (next: Time | null) => {
    if (next === null) return picker.change(null);

    const moved = atSeconds(day, secondsOf(next));
    if (withinLimits(moved, limits)) picker.change(moved);
  };

  return (
    <TimePicker
      {...props}
      value={picker.value && timeOfDay(picker.value)}
      onValueChange={pickTime}
      precision={limits.precision}
      hourCycle={field.hourCycle}
      step={limits.step}
      min={bounds?.min}
      max={bounds?.max}
      size={picker.size}
      disabled={dayUnavailable(day, limits)}
      className={cn('w-full sm:[--time-picker-height:calc(var(--time-option)*7)]', className)}
    />
  );
}

DateTimeFieldTimePicker.displayName = 'DateTimeField.TimePicker';
