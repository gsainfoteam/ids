'use client';

import { useInternalTemporalPicker } from '../../../../internal/temporal-field';
import { cn } from '../../../../utils';
import { TimePicker } from '../../../data/time-picker';
import { useInternalTimeFieldContext } from '../context';

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
  const field = useInternalTimeFieldContext('TimeField.TimePicker');
  const picker = useInternalTemporalPicker<Time | null>('TimeField.TimePicker');

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
