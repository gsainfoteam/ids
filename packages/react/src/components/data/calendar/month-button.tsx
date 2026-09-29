import { type ReactElement } from 'react';

import { type PreviousMonthButtonProps } from 'react-day-picker';

import { useCalendarContext } from './context';
import { IconButton } from '../../action/icon-button';

export function MonthButton({
  'aria-disabled': unavailable,
  children,
  ...props
}: PreviousMonthButtonProps) {
  const c = useCalendarContext('Calendar');
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
