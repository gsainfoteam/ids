'use client';

import { type MonthGridProps } from 'react-day-picker';

import { useCalendarContext } from './context';
import { mergeEventHandlers } from '../../../utils';

export function MonthGrid({ onMouseLeave, ...props }: MonthGridProps) {
  const c = useCalendarContext('Calendar');
  return (
    <table
      {...props}
      aria-readonly={c.state.readOnly || undefined}
      aria-disabled={c.state.disabled || undefined}
      onMouseLeave={mergeEventHandlers(onMouseLeave, c.onGridMouseLeave)}
    />
  );
}
