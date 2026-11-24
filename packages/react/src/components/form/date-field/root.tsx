'use client';

import { CalendarDaysIcon } from '@heroicons/react/24/outline';

import { DateFieldContext } from './context';
import { describeDates, isEmptyDates, sameDates, serializeDates } from './lib/date-value';
import { dateInputHint, parseDateText } from './lib/parse';
import { DateFieldCalendar, type DateFieldCalendarProps } from './parts/calendar';
import { resolveLocale } from '../../../internal/date-locale';
import {
  pickerPart,
  TemporalField,
  type TemporalFieldProps,
} from '../../../internal/temporal-field';
import {
  dateOptions,
  formatter,
  type TemporalFormat,
} from '../../../internal/temporal-field/lib/format';
import { useInternalProviderLocale, useInternalTranslate } from '../../../internal/translate';
import {
  emptyValue,
  isBlocked,
  validateDate,
  validateValue,
  type CalendarValue,
  type DateLimits,
  type DateSelection,
} from '../../data/calendar/lib/date';
import { toUtcDate } from '../../data/calendar/lib/day-picker-bridge';
import { useFieldSize } from '../field/context';

import type { CalendarDate } from '@internationalized/date';

export type DateFieldFormat = TemporalFormat<CalendarDate>;

const MONTHS_SIDE_BY_SIDE = 2;
const MONTH_GAP = 16;
const POPUP_PADDING_AND_BORDER = 26;

export type DateFieldProps = Omit<
  TemporalFieldProps<CalendarValue>,
  'value' | 'defaultValue' | 'onValueChange' | 'disabled'
> &
  DateLimits &
  DateSelection & {
    format?: DateFieldFormat;
  };

const PICKER_PARTS = new Set<unknown>([DateFieldCalendar]);

export function DateFieldRoot(props: DateFieldProps) {
  const t = useInternalTranslate();
  const providerLocale = useInternalProviderLocale();

  const {
    selectionMode = 'single',
    value,
    defaultValue,
    onValueChange,
    format,
    min,
    max,
    disabled,
    ...rest
  } = props;

  const empty = emptyValue(selectionMode);
  if (value !== undefined) validateValue(value, selectionMode);
  if (defaultValue !== undefined) validateValue(defaultValue, selectionMode);
  [min, max].forEach((limit) => validateDate(limit, 'DateField'));

  const dateLocale = resolveLocale(providerLocale);
  const formatDate = formatter(format, dateLocale, {
    defaults: dateOptions,
    toDate: toUtcDate,
    timeZone: 'UTC',
  });
  const cell = (useFieldSize(rest.size) ?? 'standard') === 'tiny' ? 32 : 36;
  const calendar = pickerPart<DateFieldCalendarProps>(rest.children, DateFieldCalendar);
  const shown = Math.min(calendar?.props.monthsToShow ?? 1, MONTHS_SIDE_BY_SIDE);
  return (
    <DateFieldContext value={{ selectionMode, min, max, disabled }}>
      <TemporalField<CalendarValue>
        {...rest}
        value={value}
        defaultValue={defaultValue ?? empty}
        onValueChange={onValueChange as ((value: CalendarValue) => void) | undefined}
        disabled={disabled === true}
        config={{
          kind: 'date',
          empty,
          isEmpty: isEmptyDates,
          isSame: sameDates,
          display: (next) => describeDates(next, selectionMode, formatDate),
          serialize: (next) => serializeDates(next, selectionMode),
          messages: {
            clear: t('common.clear'),
            close: t('common.close'),
            open: t('dateField.open'),
          },
          icon: CalendarDaysIcon,
          preferredWidth: cell * 7 * shown + MONTH_GAP * (shown - 1) + POPUP_PADDING_AND_BORDER,
          initialFocusSelector: '[data-calendar-day][tabindex="0"]',
          parse:
            selectionMode === 'single'
              ? (text) => {
                  const date = parseDateText(text, dateLocale);
                  return date && !isBlocked(date, { min, max, disabled }) ? date : undefined;
                }
              : undefined,
          inputHint: dateInputHint(dateLocale),
          pickerParts: PICKER_PARTS,
          picker: () => calendar ?? <DateFieldCalendar />,
        }}
      />
    </DateFieldContext>
  );
}
