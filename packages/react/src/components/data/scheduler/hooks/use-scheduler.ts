'use client';

import { useState } from 'react';

import {
  getLocalTimeZone,
  today as todayIn,
  type CalendarDate,
  type CalendarDateTime,
} from '@internationalized/date';

import { useInternalNow } from './use-now';
import { useControllableState } from '../../../../hooks/use-controllable-state';
import { validateDate } from '../../calendar/lib/date';
import {
  DEFAULT_DAY_COUNT,
  shownDayCount,
  type SchedulerEventChange,
  type SchedulerEventData,
  type SchedulerSlot,
  type SchedulerView,
} from '../lib/layout';

import type { WeekDay } from '../../../../internal/date-locale';

export type SchedulerViewsOptions = {
  value?: SchedulerView;
  defaultValue?: SchedulerView;
  onValueChange?: (view: SchedulerView) => void;
  dayCount?: number;
  defaultDayCount?: number;
  onDayCountChange?: (count: number) => void;
};

export type SchedulerNavigationOptions = {
  value?: CalendarDate;
  defaultValue?: CalendarDate;
  onValueChange?: (date: CalendarDate) => void;
  weekStartsOn?: WeekDay;
  now?: CalendarDateTime;
};

export type SchedulerEditingOptions<E extends SchedulerEventData = SchedulerEventData> = {
  onEventChange?: (event: E, change: SchedulerEventChange<E>) => void;
  onSlotSelect?: (slot: SchedulerSlot) => void;
};

export type UseSchedulerOptions<E extends SchedulerEventData = SchedulerEventData> = {
  views?: SchedulerViewsOptions;
  navigation?: SchedulerNavigationOptions;
  editing?: SchedulerEditingOptions<E>;
};

export type SchedulerInstance<E extends SchedulerEventData = SchedulerEventData> = {
  view: SchedulerView;
  setView: (view: SchedulerView) => void;
  dayCount: number;
  setDayCount: (count: number) => void;
  date: CalendarDate;
  setDate: (date: CalendarDate) => void;
  weekStartsOn: WeekDay | undefined;
  now: CalendarDateTime | undefined;
  onEventChange: ((event: E, change: SchedulerEventChange<E>) => void) | undefined;
  onSlotSelect: ((slot: SchedulerSlot) => void) | undefined;
};

export function useScheduler<E extends SchedulerEventData = SchedulerEventData>({
  views = {},
  navigation = {},
  editing = {},
}: UseSchedulerOptions<E> = {}): SchedulerInstance<E> {
  [navigation.value, navigation.defaultValue].forEach((date) => validateDate(date, 'Scheduler'));

  const [firstShownDate] = useState(() => navigation.defaultValue ?? todayIn(getLocalTimeZone()));
  const [view, setView] = useControllableState({
    value: views.value,
    defaultValue: views.defaultValue ?? 'week',
    onValueChange: views.onValueChange,
  });
  const [dayCount, setDayCount] = useControllableState({
    value: views.dayCount,
    defaultValue: views.defaultDayCount ?? DEFAULT_DAY_COUNT,
    onValueChange: views.onDayCountChange,
  });
  const [date, setDate] = useControllableState({
    value: navigation.value,
    defaultValue: firstShownDate,
    onValueChange: navigation.onValueChange,
  });
  const now = useInternalNow(navigation.now);

  return {
    view,
    setView,
    dayCount: shownDayCount(dayCount),
    setDayCount,
    date,
    setDate,
    weekStartsOn: navigation.weekStartsOn,
    now,
    onEventChange: editing.onEventChange,
    onSlotSelect: editing.onSlotSelect,
  };
}
