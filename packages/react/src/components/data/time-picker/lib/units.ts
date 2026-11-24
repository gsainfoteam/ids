import type { HourCycle, TimePrecision, TimeUnit } from './time';
import type { DateTimeFieldName, IntlWords } from '../../../../internal/lib/intl-words';

const unitField = {
  hour: 'hour',
  minute: 'minute',
  second: 'second',
  period: 'dayPeriod',
} as const satisfies Record<TimeUnit, DateTimeFieldName>;

export function unitName(unit: TimeUnit, words: IntlWords, locale: string) {
  const name = words.field(unitField[unit]);
  return name.charAt(0).toLocaleUpperCase(locale) + name.slice(1);
}

export function defaultUnits(
  precision: TimePrecision,
  hourCycle: HourCycle,
  periodLeads: boolean,
): TimeUnit[] {
  const clock: TimeUnit[] = [
    'hour',
    ...(precision !== 'hour' ? (['minute'] as const) : []),
    ...(precision === 'second' ? (['second'] as const) : []),
  ];
  if (hourCycle !== '12h') return clock;
  return periodLeads ? ['period', ...clock] : [...clock, 'period'];
}
