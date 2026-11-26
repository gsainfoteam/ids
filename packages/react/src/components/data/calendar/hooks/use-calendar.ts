'use client';

import { useState } from 'react';

import { getLocalTimeZone, today as todayIn, type CalendarDate } from '@internationalized/date';

import { useControllableState } from '../../../../hooks/use-controllable-state';
import { invariant } from '../../../../utils';
import { compareDays, firstOfMonth, validateDate, type DateMatcher } from '../lib/date';

export type CalendarAvailabilityOptions = {
  min?: CalendarDate;
  max?: CalendarDate;
  unavailable?: DateMatcher | DateMatcher[];
};

export type CalendarDisplayOptions = {
  monthsToShow?: number;
  today?: CalendarDate;
};

export type CalendarMonthOptions = {
  value?: CalendarDate;
  defaultValue?: CalendarDate;
  onValueChange?: (month: CalendarDate) => void;
};

export type UseCalendarOptions = {
  availability?: CalendarAvailabilityOptions;
  display?: CalendarDisplayOptions;
  month?: CalendarMonthOptions;
};

export type FieldCalendarOptions = {
  monthsToShow?: number;
  today?: CalendarDate;
  month?: CalendarDate;
  defaultMonth?: CalendarDate;
  onMonthChange?: (month: CalendarDate) => void;
};

export type CalendarInstance = {
  min: CalendarDate | undefined;
  max: CalendarDate | undefined;
  unavailable: DateMatcher | DateMatcher[] | undefined;
  monthsToShow: number;
  today: CalendarDate;
  month: CalendarDate | undefined;
  setMonth: (month: CalendarDate) => void;
};

const MOST_MONTHS = 12;

export function useCalendar({
  availability = {},
  display = {},
  month: monthOptions = {},
}: UseCalendarOptions = {}): CalendarInstance {
  const { min, max, unavailable } = availability;
  const { monthsToShow = 1 } = display;
  [min, max, display.today, monthOptions.value, monthOptions.defaultValue].forEach((date) =>
    validateDate(date),
  );
  invariant(
    !min || !max || compareDays(min, max) <= 0,
    'Calendar: min must not be after max (min <= max).',
  );
  invariant(
    Number.isInteger(monthsToShow) && monthsToShow >= 1 && monthsToShow <= MOST_MONTHS,
    'Calendar: monthsToShow must be 1..12.',
  );

  const [mountedToday] = useState(() => todayIn(getLocalTimeZone()));
  const [month, setMonth] = useControllableState<CalendarDate | undefined>({
    value: monthOptions.value && firstOfMonth(monthOptions.value),
    defaultValue: monthOptions.defaultValue && firstOfMonth(monthOptions.defaultValue),
    onValueChange: monthOptions.onValueChange as
      ((month: CalendarDate | undefined) => void) | undefined,
  });

  return {
    min,
    max,
    unavailable,
    monthsToShow,
    today: display.today ?? mountedToday,
    month,
    setMonth,
  };
}
