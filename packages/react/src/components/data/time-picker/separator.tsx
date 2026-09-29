'use client';

import { type ComponentProps } from 'react';

import { useTimePickerContext } from './context';
import { mergeProps, part } from '../../../utils';

export type TimePickerSeparatorProps = ComponentProps<'span'> & { asChild?: boolean };

export function TimePickerSeparator({
  asChild,
  children = ':',
  ...props
}: TimePickerSeparatorProps) {
  const c = useTimePickerContext('TimePicker.Separator');
  return part(
    'span',
    asChild,
    children,
    mergeProps({ 'aria-hidden': true, className: c.styles.separator() }, props),
  );
}

TimePickerSeparator.displayName = 'TimePicker.Separator';
