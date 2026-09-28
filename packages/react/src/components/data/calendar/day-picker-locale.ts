import { dateFormatter, formatPart, numberFormatter } from '../../../internal/date-locale';
import { messages } from '../../../internal/messages';

import type { Formatters, Labels, Modifiers, Numerals } from 'react-day-picker';

const MONTH_AND_YEAR = { year: 'numeric', month: 'long' } as const;
const TWO_DIGIT_WEEK = 2;

function localeFormats(locale: string, numerals: Numerals | undefined) {
  const numberingSystem = numerals;
  const intl = (options: Intl.DateTimeFormatOptions) =>
    dateFormatter(locale, { ...options, numberingSystem });

  return {
    numberingSystem,
    monthAndYear: intl(MONTH_AND_YEAR),
    month: intl({ month: 'long' }),
    weekdayNarrow: intl({ weekday: 'narrow' }),
    weekdayLong: intl({ weekday: 'long' }),
    fullDate: intl({ dateStyle: 'full' }),
    weekNumber: numberFormatter(locale, {
      numberingSystem,
      minimumIntegerDigits: TWO_DIGIT_WEEK,
      useGrouping: false,
    }),
  };
}

export function dayPickerFormatters(
  locale: string,
  numerals: Numerals | undefined,
): Partial<Formatters> {
  const formats = localeFormats(locale, numerals);
  const { numberingSystem } = formats;

  return {
    formatCaption: (month) => formats.monthAndYear.format(month),
    formatDay: (date) => formatPart(date, 'day', locale, { day: 'numeric', numberingSystem }),
    formatWeekdayName: (weekday) => formats.weekdayNarrow.format(weekday),
    formatMonthDropdown: (month) => formats.month.format(month),
    formatYearDropdown: (year) =>
      formatPart(year, 'year', locale, { year: 'numeric', numberingSystem }),
    formatWeekNumber: (week) => formats.weekNumber.format(week),
  };
}

export function dayPickerLabels(locale: string, numerals: Numerals | undefined): Partial<Labels> {
  const formats = localeFormats(locale, numerals);
  const describeDay = (date: Date, modifiers: Partial<Modifiers> | undefined) =>
    [
      modifiers?.today && messages.calendar.today,
      formats.fullDate.format(date),
      modifiers?.selected && messages.calendar.selected,
    ]
      .filter(Boolean)
      .join(', ');

  return {
    labelPrevious: () => messages.calendar.previousMonth,
    labelNext: () => messages.calendar.nextMonth,
    labelMonthDropdown: () => messages.calendar.month,
    labelYearDropdown: () => messages.calendar.year,
    labelWeekNumber: (week) => messages.calendar.weekNumber(week),
    labelWeekNumberHeader: () => messages.calendar.weekNumberHeader,
    labelGrid: (month) => formats.monthAndYear.format(month),
    labelWeekday: (weekday) => formats.weekdayLong.format(weekday),
    labelDayButton: (date, modifiers) => describeDay(date, modifiers),
    labelGridcell: (date, modifiers) => describeDay(date, { today: modifiers?.today }),
  };
}
