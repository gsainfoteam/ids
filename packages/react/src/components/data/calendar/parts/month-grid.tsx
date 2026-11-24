'use client';

import { type MonthGridProps } from 'react-day-picker';

import { mergeEventHandlers } from '../../../../utils';
import { useInternalCalendarContext } from '../context';

export function MonthGrid({ onMouseLeave, ...props }: MonthGridProps) {
  const c = useInternalCalendarContext('Calendar');
  return (
    <table
      {...props}
      aria-readonly={c.state.readOnly || undefined}
      aria-disabled={c.state.disabled || undefined}
      onMouseLeave={mergeEventHandlers(onMouseLeave, c.onGridMouseLeave)}
    />
  );
}
