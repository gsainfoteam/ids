'use client';

import { ClockIcon } from '@heroicons/react/24/outline';

import { TimeFieldContext } from './context';
import { TimeFieldTimePicker } from './time-picker';
import { resolveLocale } from '../../../internal/date-locale';
import {
  pickerPart,
  TemporalField,
  type TemporalFieldProps,
} from '../../../internal/temporal-field';
import {
  formatter,
  timeOptions,
  type TemporalFormat,
} from '../../../internal/temporal-field/format';
import { useProviderLocale, useTranslate } from '../../../internal/translate';
import {
  onUtcSampleDay,
  resolveHourCycle,
  sameTime,
  timeKey,
  validateTime,
  type HourCycle,
  type TimePrecision,
} from '../../data/time-picker/time';

import type { Time } from '@internationalized/date';

export type TimeFieldProps = TemporalFieldProps<Time | null> & {
  precision?: TimePrecision;
  format?: TemporalFormat<Time>;
  hourCycle?: HourCycle;
  step?: number;
  min?: Time;
  max?: Time;
};

const PICKER_PARTS = new Set<unknown>([TimeFieldTimePicker]);

export function TimeFieldRoot({
  precision = 'minute',
  format,
  hourCycle,
  step = 1,
  min,
  max,
  ...props
}: TimeFieldProps) {
  const t = useTranslate();
  const providerLocale = useProviderLocale();
  validateTime(props.value, 'TimeField');
  validateTime(props.defaultValue, 'TimeField');
  validateTime(min, 'TimeField');
  validateTime(max, 'TimeField');

  const dateLocale = resolveLocale(providerLocale);
  const display = formatter(format, dateLocale, {
    defaults: timeOptions(precision),
    toDate: onUtcSampleDay,
    cycle: resolveHourCycle(hourCycle, dateLocale),
    timeZone: 'UTC',
  });

  const timePicker = pickerPart(props.children, TimeFieldTimePicker);

  return (
    <TimeFieldContext value={{ precision, hourCycle, step, min, max }}>
      <TemporalField
        {...props}
        config={{
          kind: 'time',
          empty: null,
          isEmpty: (value) => value === null,
          isSame: sameTime,
          display: (value) => display(value!),
          serialize: (value) => timeKey(value!, precision),
          messages: {
            placeholder: t('timeField.placeholder'),
            title: t('timeField.title'),
            clear: t('timeField.clear'),
            close: t('timeField.close'),
          },
          icon: ClockIcon,
          initialFocusSelector: '[data-time-column]',
          pickerParts: PICKER_PARTS,
          picker: () => timePicker ?? <TimeFieldTimePicker />,
        }}
      />
    </TimeFieldContext>
  );
}
