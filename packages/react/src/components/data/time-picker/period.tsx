import { ColumnView } from './column-view';

import type { TimePickerColumnProps } from './column';

export type TimePickerPeriodProps = Omit<TimePickerColumnProps, 'unit'>;

export function TimePickerPeriod(props: TimePickerPeriodProps) {
  return <ColumnView {...props} unit="period" />;
}

TimePickerPeriod.displayName = 'TimePicker.Period';
