import { messages } from '../../../internal/messages';

import type { HourCycle, TimePrecision, TimeUnit } from './time';

export const unitMessage: Record<TimeUnit, string> = {
  hour: messages.timePicker.hour,
  minute: messages.timePicker.minute,
  second: messages.timePicker.second,
  period: messages.timePicker.period,
};

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
