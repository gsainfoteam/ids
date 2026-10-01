import type { HourCycle, TimePrecision, TimeUnit } from './time';
import type { IdsMessageKey } from '../../../internal/messages';

export const unitMessageKey = {
  hour: 'timePicker.hour',
  minute: 'timePicker.minute',
  second: 'timePicker.second',
  period: 'timePicker.period',
} as const satisfies Record<TimeUnit, IdsMessageKey>;

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
