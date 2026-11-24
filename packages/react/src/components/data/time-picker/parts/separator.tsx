'use client';

import { type ComponentProps } from 'react';

import { mergeProps, part } from '../../../../utils';
import { useInternalTimePickerContext } from '../context';

export type TimePickerSeparatorProps = ComponentProps<'span'> & { asChild?: boolean };

export function TimePickerSeparator({
  asChild,
  children = ':',
  ...props
}: TimePickerSeparatorProps) {
  const c = useInternalTimePickerContext('TimePicker.Separator');
  return part(
    'span',
    asChild,
    children,
    mergeProps({ 'aria-hidden': true, className: c.styles.separator() }, props),
  );
}

TimePickerSeparator.displayName = 'TimePicker.Separator';
