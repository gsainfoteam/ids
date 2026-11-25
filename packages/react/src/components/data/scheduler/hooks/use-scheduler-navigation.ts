'use client';

import { useState } from 'react';

import { getLocalTimeZone, today as todayIn, type CalendarDate } from '@internationalized/date';

import { useControllableState } from '../../../../hooks/use-controllable-state';
import { shownDayCount, type SchedulerView } from '../lib/layout';

type NavigationOptions = {
  view: SchedulerView | undefined;
  defaultView: SchedulerView;
  onViewChange: ((view: SchedulerView) => void) | undefined;
  dayCount: number | undefined;
  defaultDayCount: number;
  onDayCountChange: ((count: number) => void) | undefined;
  date: CalendarDate | undefined;
  defaultDate: CalendarDate | undefined;
  onDateChange: ((date: CalendarDate) => void) | undefined;
};

export function useInternalSchedulerNavigation(options: NavigationOptions) {
  const [firstShownDate] = useState(() => options.defaultDate ?? todayIn(getLocalTimeZone()));

  const [view, setView] = useControllableState({
    value: options.view,
    defaultValue: options.defaultView,
    onValueChange: options.onViewChange,
  });
  const [dayCountValue, setDayCount] = useControllableState({
    value: options.dayCount,
    defaultValue: options.defaultDayCount,
    onValueChange: options.onDayCountChange,
  });
  const [date, setDate] = useControllableState({
    value: options.date,
    defaultValue: firstShownDate,
    onValueChange: options.onDateChange,
  });

  return {
    view,
    setView,
    dayCount: shownDayCount(dayCountValue),
    setDayCount,
    date,
    setDate,
  };
}
