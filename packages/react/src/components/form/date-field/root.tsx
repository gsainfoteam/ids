'use client';

import { CalendarDaysIcon } from '@heroicons/react/24/outline';

import { describeDates, isEmptyDates, sameDates, serializeDates } from './date-value';
import { dateInputHint, parseDateText } from './parse';
import { resolveLocale } from '../../../internal/date-locale';
import { TemporalField, type TemporalFieldProps } from '../../../internal/temporal-field';
import {
  dateOptions,
  formatter,
  type TemporalFormat,
} from '../../../internal/temporal-field/format';
import { useProviderLocale, useTranslate } from '../../../internal/translate';
import { Calendar, CalendarPickContext, type CalendarOptions } from '../../data/calendar';
import {
  emptyValue,
  isBlocked,
  validateValue,
  type CalendarValue,
  type DateSelection,
} from '../../data/calendar/date';
import { toUtcDate } from '../../data/calendar/day-picker-bridge';
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
  Omit<CalendarOptions, 'autoFocus' | 'size' | 'readOnly' | 'dir'> &
  DateSelection & {
    format?: DateFieldFormat;
  };

export function DateFieldRoot(props: DateFieldProps) {
  const t = useTranslate();
  const providerLocale = useProviderLocale();

  const {
    selectionMode = 'single',
    value,
    defaultValue,
    onValueChange,
    format,
    min,
    max,
    disabled,
    monthsToShow = 1,
    locale,
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
    ...rest
  } = props;

  const empty = emptyValue(selectionMode);
  if (value !== undefined) validateValue(value, selectionMode);
  if (defaultValue !== undefined) validateValue(defaultValue, selectionMode);

  const dateLocale = resolveLocale(locale ?? providerLocale);
  const formatDate = formatter(format, dateLocale, {
    defaults: dateOptions,
    toDate: toUtcDate,
    timeZone: 'UTC',
  });
  const cell = (useFieldSize(rest.size) ?? 'standard') === 'tiny' ? 32 : 36;
  const shown = Math.min(monthsToShow, MONTHS_SIDE_BY_SIDE);
  const range = selectionMode === 'range';
  return (
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
          placeholder: t(range ? 'dateField.rangePlaceholder' : 'dateField.placeholder'),
          title: t(range ? 'dateField.rangeTitle' : 'dateField.title'),
          clear: t('dateField.clear'),
          close: t('dateField.close'),
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
        picker: ({ value: current, change, close, size }) => (
          <CalendarPickContext value={selectionMode === 'single' ? () => close(true) : null}>
            <Calendar
              {...({ selectionMode, value: current, onValueChange: change } as Calendar.Props)}
              min={min}
              max={max}
              disabled={disabled === true ? undefined : disabled}
              monthsToShow={monthsToShow}
              locale={dateLocale}
              weekStartsOn={weekStartsOn}
              captionLayout={captionLayout}
              month={month}
              defaultMonth={defaultMonth}
              onMonthChange={onMonthChange}
              today={today}
              showOutsideDays={showOutsideDays}
              fixedWeeks={fixedWeeks}
              showWeekNumber={showWeekNumber}
              numerals={numerals}
              modifiers={modifiers}
              modifiersClassNames={modifiersClassNames}
              renderDay={renderDay}
              footer={footer}
              size={size}
            />
          </CalendarPickContext>
        ),
      }}
    />
  );
}
