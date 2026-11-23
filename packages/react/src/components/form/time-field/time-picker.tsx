'use client';

import { useTimeFieldContext } from './context';
import { useTemporalPicker } from '../../../internal/temporal-field';
import { cn } from '../../../utils';
import { TimePicker } from '../../data/time-picker';

import type { Time } from '@internationalized/date';

export type TimeFieldTimePickerProps = Omit<
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

export function TimeFieldTimePicker({ className, ...props }: TimeFieldTimePickerProps) {
  const field = useTimeFieldContext('TimeField.TimePicker');
  const picker = useTemporalPicker<Time | null>('TimeField.TimePicker');

  return (
    <TimePicker
      {...props}
      value={picker.value}
      onValueChange={picker.change}
      precision={field.precision}
      hourCycle={field.hourCycle}
      step={field.step}
      min={field.min}
      max={field.max}
      size={picker.size}
      className={cn('w-full', className)}
    />
  );
}

TimeFieldTimePicker.displayName = 'TimeField.TimePicker';
