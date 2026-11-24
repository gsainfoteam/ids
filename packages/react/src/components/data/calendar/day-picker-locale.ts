import { dateFormatter, formatPart, numberFormatter } from '../../../internal/date-locale';

import type { IntlWords } from '../../../internal/intl-words';
import type { Formatters, Labels, Modifiers } from 'react-day-picker';

const MONTH_AND_YEAR = { year: 'numeric', month: 'long' } as const;
const TWO_DIGIT_WEEK = 2;

function localeFormats(locale: string) {
  const intl = (options: Intl.DateTimeFormatOptions) => dateFormatter(locale, options);

  return {
    monthAndYear: intl(MONTH_AND_YEAR),
    month: intl({ month: 'long' }),
    weekdayNarrow: intl({ weekday: 'narrow' }),
    weekdayLong: intl({ weekday: 'long' }),
    fullDate: intl({ dateStyle: 'full' }),
    weekNumber: numberFormatter(locale, {
      minimumIntegerDigits: TWO_DIGIT_WEEK,
      useGrouping: false,
    }),
  };
}

export function dayPickerFormatters(locale: string): Partial<Formatters> {
  const formats = localeFormats(locale);

  return {
    formatCaption: (month) => formats.monthAndYear.format(month),
    formatDay: (date) => formatPart(date, 'day', locale, { day: 'numeric' }),
    formatWeekdayName: (weekday) => formats.weekdayNarrow.format(weekday),
    formatMonthDropdown: (month) => formats.month.format(month),
    formatYearDropdown: (year) => formatPart(year, 'year', locale, { year: 'numeric' }),
    formatWeekNumber: (week) => formats.weekNumber.format(week),
  };
}

export function dayPickerLabels(locale: string, words: IntlWords): Partial<Labels> {
  const formats = localeFormats(locale);
  const describeDay = (date: Date, modifiers: Partial<Modifiers> | undefined) =>
    [modifiers?.today && words.relative(0, 'day'), formats.fullDate.format(date)]
      .filter(Boolean)
      .join(', ');

  return {
    labelPrevious: () => words.relative(-1, 'month'),
    labelNext: () => words.relative(1, 'month'),
    labelMonthDropdown: () => words.field('month'),
    labelYearDropdown: () => words.field('year'),
    labelWeekNumber: (week) => formats.weekNumber.format(week),
    labelWeekNumberHeader: () => words.field('weekOfYear'),
    labelGrid: (month) => formats.monthAndYear.format(month),
    labelWeekday: (weekday) => formats.weekdayLong.format(weekday),
    labelDayButton: (date, modifiers) => describeDay(date, modifiers),
    labelGridcell: (date, modifiers) => describeDay(date, { today: modifiers?.today }),
  };
}
