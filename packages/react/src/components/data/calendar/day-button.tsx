import { useEffect, useRef } from 'react';

import { type DayButtonProps } from 'react-day-picker';

import { useCalendarContext } from './context';
import { dayKey } from './date';
import { fromLocalDate } from './day-picker-bridge';
import { calendarStyle } from './style';

import type { CalendarDayState } from '.';

export function CalendarDayButton({
  day,
  modifiers,
  className,
  children,
  ...props
}: DayButtonProps) {
  const c = useCalendarContext('Calendar');
  const own = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (modifiers.focused) own.current?.focus();
  }, [modifiers.focused]);

  const preview = !!modifiers.range_preview && !modifiers.selected;
  const styles = calendarStyle({
    size: c.size,
    selected: !!modifiers.selected && !modifiers.range_middle,
    onBand: !!modifiers.range_middle || preview,
    today: !!modifiers.today,
    outside: !!modifiers.outside,
    unavailable: !!modifiers.disabled,
  });
  const flag = (on: boolean | undefined) => (on ? '' : undefined);
  const date = fromLocalDate(day.date);

  const dayState: CalendarDayState = {
    selected: !!modifiers.selected,
    today: !!modifiers.today,
    outside: !!modifiers.outside,
    disabled: !!modifiers.disabled,
    rangeStart: !!modifiers.range_start,
    rangeMiddle: !!modifiers.range_middle,
    rangeEnd: !!modifiers.range_end,
    modifiers: Object.fromEntries(c.modifierNames.map((name) => [name, !!modifiers[name]])),
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
      className={styles.dayButton({ className })}
    >
      {c.renderDay ? c.renderDay(date, dayState) : children}
    </button>
  );
}
