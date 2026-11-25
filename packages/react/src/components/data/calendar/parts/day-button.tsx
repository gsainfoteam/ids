'use client';

import { type DayButtonProps } from 'react-day-picker';

import { cn } from '../../../../utils';
import { useInternalCalendarContext } from '../context';
import { useInternalCalendarDayFocus } from '../hooks/use-calendar-day-focus';
import { dayKey } from '../lib/date';
import { fromLocalDate } from '../lib/day-picker-bridge';
import { calendarStyle } from '../style';

import type { CalendarDayState } from '..';

export function CalendarDayButton({
  day,
  modifiers,
  className,
  children,
  ...props
}: DayButtonProps) {
  const c = useInternalCalendarContext('Calendar');
  const own = useInternalCalendarDayFocus(modifiers.focused);

  const preview = !!modifiers.range_preview && !modifiers.selected;
  const styles = calendarStyle({
    size: c.size,
    selected: !!modifiers.selected && !modifiers.range_middle,
    band: modifiers.range_middle ? 'range' : preview ? 'preview' : 'none',
    today: !!modifiers.today,
    outside: !!modifiers.outside,
    unavailable: !!modifiers.disabled,
  });
  const flag = (on: boolean | undefined) => (on ? '' : undefined);
  const date = fromLocalDate(day.date);
  const modifierNames = Object.keys(c.day?.modifiers ?? {});

  const dayState: CalendarDayState = {
    selected: !!modifiers.selected,
    today: !!modifiers.today,
    outside: !!modifiers.outside,
    disabled: !!modifiers.disabled,
    rangeStart: !!modifiers.range_start,
    rangeMiddle: !!modifiers.range_middle,
    rangeEnd: !!modifiers.range_end,
    modifiers: Object.fromEntries(modifierNames.map((name) => [name, !!modifiers[name]])),
  };

  return (
    <button
      {...props}
      ref={own}
      data-calendar-day={dayKey(date)}
      data-selected={flag(modifiers.selected)}
      data-today={flag(modifiers.today)}
      data-disabled={flag(modifiers.disabled)}
      data-outside={flag(modifiers.outside)}
      data-range-start={flag(modifiers.range_start)}
      data-range-middle={flag(modifiers.range_middle)}
      data-range-end={flag(modifiers.range_end)}
      data-range-preview={flag(preview)}
      className={styles.dayButton({ className: cn(className, c.day?.className) })}
    >
      {c.day?.children ? c.day.children(date, dayState) : children}
    </button>
  );
}
