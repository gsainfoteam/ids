'use client';

import { type ReactElement } from 'react';

import { type PreviousMonthButtonProps } from 'react-day-picker';

import { IconButton } from '../../../action/icon-button';
import { useInternalCalendarContext } from '../context';

export function MonthButton({
  'aria-disabled': unavailable,
  children,
  ...props
}: PreviousMonthButtonProps) {
  const c = useInternalCalendarContext('Calendar');
  return (
    <IconButton
      {...props}
      variant="ghost"
      size={c.size}
      disabled={unavailable === true || unavailable === 'true'}
      focusableWhenDisabled
      icon={children as ReactElement}
    />
  );
}
