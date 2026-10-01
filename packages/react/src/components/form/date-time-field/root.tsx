'use client';

import { useState } from 'react';

import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import {
  getLocalTimeZone,
  Time,
  today as todayIn,
  type CalendarDate,
  type CalendarDateTime,
} from '@internationalized/date';

import {
  atSeconds,
  compareDateTimes,
  dayBounds,
  dayOf,
  dayUnavailable,
  onDay,
  sameInstant,
  serializeDateTime,
  timeOfDay,
  toUtcDateTime,
  validateDateTime,
  withinLimits,
  type DateTimeLimits,
} from './date-time';
import { resolveLocale } from '../../../internal/date-locale';
import {
  TemporalField,
  temporalFieldStyle,
  type TemporalChange,
  type TemporalFieldProps,
} from '../../../internal/temporal-field';
import {
  dateOptions,
  formatter,
  timeOptions,
  type TemporalFormat,
} from '../../../internal/temporal-field/format';
import { useProviderLocale, useTranslate } from '../../../internal/translate';
import { invariant } from '../../../utils';
import { Calendar, type CalendarOptions } from '../../data/calendar';
import { TimePicker, type TimePickerVariant } from '../../data/time-picker';
import {
  resolveHourCycle,
  secondsOf,
  type HourCycle,
  type TimePrecision,
} from '../../data/time-picker/time';
import { useFieldSize } from '../field/context';

import type { IdsSize } from '../../../tokens/types';

type DateTimeCalendarOptions = Omit<
  CalendarOptions,
  'autoFocus' | 'size' | 'readOnly' | 'dir' | 'min' | 'max'
>;

export type DateTimeFieldProps = Omit<TemporalFieldProps<CalendarDateTime | null>, 'disabled'> &
  DateTimeCalendarOptions & {
    min?: CalendarDateTime;
    max?: CalendarDateTime;
    precision?: TimePrecision;
    format?: TemporalFormat<CalendarDateTime>;
    hourCycle?: HourCycle;
    step?: number;
    pickerVariant?: TimePickerVariant;
  };

type PanelProps = Omit<DateTimeCalendarOptions, 'locale' | 'disabled' | 'today'> & {
  value: CalendarDateTime | null;
  change: TemporalChange<CalendarDateTime | null>;
  size: IdsSize;
  today: CalendarDate;
  limits: DateTimeLimits;
  cycle: HourCycle | undefined;
  locale: string;
  pickerVariant?: TimePickerVariant;
};

const MONTH_GAP = 16;
const CLOCK_COLUMN = 208;
const POPUP_PADDING_AND_BORDER = 26;
const MIDNIGHT = new Time();

function Panel({
  value,
  change,
  size,
  today,
  limits,
  cycle,
  locale,
  pickerVariant,
  ...calendar
}: PanelProps) {
  const t = useTranslate();

  const styles = temporalFieldStyle({ size });
  const day = value ? dayOf(value) : today;
  const clock = value ? timeOfDay(value) : MIDNIGHT;
  const unavailable = dayUnavailable(day, limits);
  const bounds = dayBounds(day, limits.min, limits.max);

  const pickDay = (next: CalendarDate | null) => {
    const moved = next && onDay(next, clock, limits);
    if (moved) change(moved);
  };

  const pickTime = (next: Time | null) => {
    if (next === null) return change(null);

    const moved = atSeconds(day, secondsOf(next));
    if (withinLimits(moved, limits)) change(moved);
  };

  return (
    <div className={styles.panel()}>
      <Calendar
        {...calendar}
        locale={locale}
        value={value && dayOf(value)}
        onValueChange={pickDay}
        min={limits.min && dayOf(limits.min)}
        max={limits.max && dayOf(limits.max)}
        disabled={(candidate) => dayUnavailable(candidate, limits)}
        today={today}
        size={size}
      />
      <div className={styles.panelTime()}>
        <TimePicker
          value={value && timeOfDay(value)}
          onValueChange={pickTime}
          precision={limits.precision}
          hourCycle={cycle}
          step={limits.step}
          min={bounds?.min}
          max={bounds?.max}
          locale={locale}
          variant={pickerVariant}
          size={size}
          disabled={unavailable}
          className="w-full sm:[--time-picker-height:calc(var(--time-option)*7)]"
        />
        {unavailable && <p className={styles.panelHint()}>{t('dateTimeField.pickDateFirst')}</p>}
      </div>
    </div>
  );
}

export function DateTimeFieldRoot({
  precision = 'minute',
  format,
  hourCycle,
  step = 1,
  min,
  max,
  disabled,
  locale,
  pickerVariant,
  monthsToShow = 1,
  weekStartsOn,
  captionLayout,
  month,
  defaultMonth,
  onMonthChange,
  today,
  showOutsideDays,
  fixedWeeks,
  showWeekNumber,
  numerals,
  modifiers,
  modifiersClassNames,
  renderDay,
  footer,
  ...props
}: DateTimeFieldProps) {
  const t = useTranslate();
  const providerLocale = useProviderLocale();
  [props.value, props.defaultValue, min, max].forEach(validateDateTime);
  invariant(
    !min || !max || compareDateTimes(min, max) <= 0,
    'DateTimeField: min must not be after max (min <= max).',
  );

  const [mountedToday] = useState(() => todayIn(getLocalTimeZone()));
  const anchor = today ?? mountedToday;
  const dateLocale = resolveLocale(locale ?? providerLocale);
  const display = formatter(format, dateLocale, {
    defaults: { ...dateOptions, ...timeOptions(precision) },
    toDate: toUtcDateTime,
    cycle: resolveHourCycle(hourCycle, dateLocale),
    timeZone: 'UTC',
  });
  const limits: DateTimeLimits = { min, max, disabled, precision, step };
  const cell = (useFieldSize(props.size) ?? 'standard') === 'tiny' ? 32 : 36;

  return (
    <TemporalField
      {...props}
      disabled={disabled === true}
      config={{
        kind: 'date-time',
        empty: null,
        isEmpty: (value) => value === null,
        isSame: sameInstant,
        display: (value) => display(value!),
        serialize: (value) => serializeDateTime(value!, precision),
        messages: {
          placeholder: t('dateTimeField.placeholder'),
          title: t('dateTimeField.title'),
          clear: t('dateTimeField.clear'),
          close: t('dateTimeField.close'),
        },
        icon: CalendarDaysIcon,
        preferredWidth:
          cell * 7 * monthsToShow +
          MONTH_GAP * monthsToShow +
          CLOCK_COLUMN +
          POPUP_PADDING_AND_BORDER,
        initialFocusSelector: '[data-calendar-day][tabindex="0"]',
        picker: ({ value, change, size }) => (
          <Panel
            value={value}
            change={change}
            size={size}
            today={anchor}
            limits={limits}
            cycle={hourCycle}
            locale={dateLocale}
            pickerVariant={pickerVariant}
            monthsToShow={monthsToShow}
            weekStartsOn={weekStartsOn}
            captionLayout={captionLayout}
            month={month}
            defaultMonth={defaultMonth}
            onMonthChange={onMonthChange}
            showOutsideDays={showOutsideDays}
            fixedWeeks={fixedWeeks}
            showWeekNumber={showWeekNumber}
            numerals={numerals}
            modifiers={modifiers}
            modifiersClassNames={modifiersClassNames}
            renderDay={renderDay}
            footer={footer}
          />
        ),
      }}
    />
  );
}
