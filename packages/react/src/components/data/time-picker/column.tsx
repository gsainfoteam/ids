import { type ComponentProps, type ReactNode } from 'react';

import { ColumnView } from './column-view';

import type { TimePickerOptionState } from './use-time-picker';

export type TimePickerColumnProps = Omit<ComponentProps<'div'>, 'children'> & {
  unit: 'hour' | 'minute' | 'second';
  asChild?: boolean;
  children?: ReactNode | ((option: TimePickerOptionState) => ReactNode);
};

export function TimePickerColumn(props: TimePickerColumnProps) {
  return <ColumnView {...props} />;
}

TimePickerColumn.displayName = 'TimePicker.Column';
