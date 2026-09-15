import { useState } from 'react';

import { invariant } from '../../utils';
import { Calendar, type CalendarOptions } from '../calendar';
import { dayKey, dayOnly, sameDay } from '../calendar/date';
import {
  TemporalField,
  TemporalTrigger,
  TemporalValue,
  TemporalContent,
  TemporalClear,
  type TemporalFieldProps,
  type TriggerProps as SharedTriggerProps,
  type ValueProps as SharedValueProps,
  type ContentProps as SharedContentProps,
} from '../temporal-field';
import { temporalFormatter } from '../temporal-field/format';
import { TimePicker } from '../time-picker';
import {
  nearestSlot,
  secondsOf,
  timeKey,
  timeSlots,
  validateTime,
  withTime,
  type TimeFormat,
  type TimePrecision,
} from '../time-picker/time';
export type DateTimeFieldProps = Omit<TemporalFieldProps, 'disabled'> &
  Omit<CalendarOptions, 'autoFocus'> & {
    precision?: TimePrecision;
    format?: string;
    hourCycle?: TimeFormat;
    step?: number;
    pickerVariant?: 'grid' | 'wheel';
  };
function dayBounds(day: Date, min?: Date, max?: Date): { min?: Date; max?: Date } | null {
  const key = dayKey(day);
  if ((min && key < dayKey(min)) || (max && key > dayKey(max))) return null;
  const lower =
    min && sameDay(day, min) ? new Date(Math.ceil(min.getTime() / 1000) * 1000) : undefined;
  if (lower && (!sameDay(lower, day) || (max && lower > max))) return null;
  return { min: lower, max: max && sameDay(day, max) ? max : undefined };
}
export function DateTimeField({
  precision = 'minute',
  format,
  hourCycle,
  step = 1,
  min,
  max,
  locale = 'en-US',
  pickerVariant,
  disabled,
  monthsToShow = 1,
  weekStartsOn,
  month,
  defaultMonth,
  onMonthChange,
  today,
  ...props
}: DateTimeFieldProps) {
  validateTime(min);
  validateTime(max);
  invariant(!min || !max || min <= max, 'DateTimeField: min must be <= max.');
  const [mountedToday] = useState(() => new Date());
  const anchorDay = today ?? mountedToday,
    cycle = hourCycle ?? (format === '12h' || format === '24h' ? format : undefined);
  const display = temporalFormatter(format, locale, precision, cycle, true);
  return (
    <TemporalField
      {...props}
      disabled={disabled === true}
      label="날짜와 시간"
      display={display}
      serialize={(d) => `${dayKey(d)}T${timeKey(d, precision)}`}
      preferredWidth={600}
      initialFocusSelector={'[data-calendar-day][tabindex="0"]'}
      picker={({ value, change }) => {
        const base = value ?? dayOnly(anchorDay);
        const cache = new Map<string, number[]>();
        const slotsFor = (day: Date) => {
          const key = dayKey(day);
          if (cache.has(key)) return cache.get(key)!;
          const bounds = dayBounds(day, min, max);
          const slots = bounds
            ? timeSlots(day, precision, step, bounds.min, bounds.max).filter((s) => {
                const d = withTime(day, s)!;
                return (!min || d >= min) && (!max || d <= max);
              })
            : [];
          cache.set(key, slots);
          return slots;
        };
        const dayDisabled = (day: Date) => {
          if (typeof disabled === 'function' && disabled(day)) return true;
          const bounds = dayBounds(day, min, max);
          if (!bounds) return true;
          return bounds.min || bounds.max ? slotsFor(day).length === 0 : false;
        };
        const bounds = dayBounds(base, min, max),
          unavailable = dayDisabled(base);
        return (
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="min-w-0 flex-1">
              <Calendar
                value={value}
                onChange={(day) => {
                  if (!day) return;
                  const seconds = nearestSlot(slotsFor(day), secondsOf(base));
                  if (seconds !== undefined) change(withTime(day, seconds));
                }}
                min={min}
                max={max}
                disabled={dayDisabled}
                monthsToShow={monthsToShow}
                locale={locale}
                weekStartsOn={weekStartsOn}
                month={month}
                defaultMonth={defaultMonth}
                onMonthChange={onMonthChange}
                today={anchorDay}
                size={props.size}
              />
            </div>
            <div className="min-w-0 sm:w-52">
              <TimePicker
                value={withTime(
                  base,
                  nearestSlot(slotsFor(base), secondsOf(base)) ?? secondsOf(base),
                )}
                onChange={(next) => {
                  if (!dayDisabled(next) && (!min || next >= min) && (!max || next <= max))
                    change(next);
                }}
                precision={precision}
                format={cycle}
                step={step}
                min={bounds?.min}
                max={bounds?.max}
                locale={locale}
                size={props.size}
                variant={pickerVariant}
                disabled={unavailable}
              />
              {unavailable && <p className="mt-2 text-sm">선택 가능한 날짜를 먼저 고르세요.</p>}
            </div>
          </div>
        );
      }}
    />
  );
}
export namespace DateTimeField {
  export type Props = DateTimeFieldProps;
  export type TriggerProps = SharedTriggerProps;
  export type ClearProps = TriggerProps;
  export type ValueProps = SharedValueProps;
  export type ContentProps = SharedContentProps;
  export const Trigger = TemporalTrigger,
    Value = TemporalValue,
    Content = TemporalContent,
    Clear = TemporalClear;
}
