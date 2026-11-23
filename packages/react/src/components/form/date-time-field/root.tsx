'use client';

import { useState, type ReactNode } from 'react';

import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { getLocalTimeZone, today as todayIn, type CalendarDateTime } from '@internationalized/date';

import { DateTimeFieldContext, useInternalDateTimeFieldContext } from './context';
import {
  compareDateTimes,
  dayOf,
  dayUnavailable,
  sameInstant,
  serializeDateTime,
  toUtcDateTime,
  validateDateTime,
  type DateTimeLimits,
} from './lib/date-time';
import { DateTimeFieldCalendar, type DateTimeFieldCalendarProps } from './parts/calendar';
import { DateTimeFieldTimePicker } from './parts/time-picker';
import { resolveLocale } from '../../../internal/date-locale';
import {
  pickerPart,
  TemporalField,
  temporalFieldStyle,
  useInternalTemporalPicker,
  type TemporalFieldProps,
} from '../../../internal/temporal-field';
import {
  dateOptions,
  formatter,
  timeOptions,
  type TemporalFormat,
} from '../../../internal/temporal-field/lib/format';
import { useInternalProviderLocale, useInternalTranslate } from '../../../internal/translate';
import { invariant } from '../../../utils';
import { type DateMatcher } from '../../data/calendar';
import {
  resolveHourCycle,
  type HourCycle,
  type TimePrecision,
} from '../../data/time-picker/lib/time';
import { useFieldSize } from '../field/context';

export type DateTimeFieldProps = Omit<TemporalFieldProps<CalendarDateTime | null>, 'disabled'> & {
  min?: CalendarDateTime;
  max?: CalendarDateTime;
  disabled?: DateMatcher | DateMatcher[];
  precision?: TimePrecision;
  format?: TemporalFormat<CalendarDateTime>;
  hourCycle?: HourCycle;
  step?: number;
};

const MONTH_GAP = 16;
const CLOCK_COLUMN = 208;
const POPUP_PADDING_AND_BORDER = 26;
const PICKER_PARTS = new Set<unknown>([DateTimeFieldCalendar, DateTimeFieldTimePicker]);

function Panel({ calendar, timePicker }: { calendar: ReactNode; timePicker: ReactNode }) {
  const t = useInternalTranslate();
  const field = useInternalDateTimeFieldContext('DateTimeField');
  const picker = useInternalTemporalPicker<CalendarDateTime | null>('DateTimeField');

  const styles = temporalFieldStyle({ size: picker.size });
  const day = picker.value ? dayOf(picker.value) : field.today;
  const unavailable = dayUnavailable(day, field.limits);

  return (
    <div className={styles.panel()}>
      {calendar ?? <DateTimeFieldCalendar />}
      <div className={styles.panelTime()}>
        {timePicker ?? <DateTimeFieldTimePicker />}
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
  ...props
}: DateTimeFieldProps) {
  const t = useInternalTranslate();
  const providerLocale = useInternalProviderLocale();
  [props.value, props.defaultValue, min, max].forEach(validateDateTime);
  invariant(
    !min || !max || compareDateTimes(min, max) <= 0,
    'DateTimeField: min must not be after max (min <= max).',
  );

  const calendar = pickerPart<DateTimeFieldCalendarProps>(props.children, DateTimeFieldCalendar);
  const timePicker = pickerPart(props.children, DateTimeFieldTimePicker);
  const monthsToShow = calendar?.props.monthsToShow ?? 1;
  const [mountedToday] = useState(() => todayIn(getLocalTimeZone()));
  const anchor = calendar?.props.today ?? mountedToday;
  const dateLocale = resolveLocale(providerLocale);
  const display = formatter(format, dateLocale, {
    defaults: { ...dateOptions, ...timeOptions(precision) },
    toDate: toUtcDateTime,
    cycle: resolveHourCycle(hourCycle, dateLocale),
    timeZone: 'UTC',
  });
  const limits: DateTimeLimits = { min, max, disabled, precision, step };
  const cell = (useFieldSize(props.size) ?? 'standard') === 'tiny' ? 32 : 36;

  return (
    <DateTimeFieldContext value={{ today: anchor, limits, hourCycle }}>
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
          pickerParts: PICKER_PARTS,
          picker: () => <Panel calendar={calendar} timePicker={timePicker} />,
        }}
      />
    </DateTimeFieldContext>
  );
}
