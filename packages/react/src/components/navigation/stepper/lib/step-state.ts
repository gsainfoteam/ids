export type StepperStatus = 'completed' | 'current' | 'upcoming' | 'error';
export type StepperItemStatus = Exclude<StepperStatus, 'current'>;
export type TimelineStatus = 'completed' | 'error' | 'neutral';
export type StepStatus = StepperStatus | TimelineStatus;

export function stepStatus(
  index: number,
  current: number,
  given: StepperItemStatus | undefined,
): StepperStatus {
  if (given === 'error') return 'error';
  if (index === current) return 'current';
  if (given !== undefined) return given;
  return index < current ? 'completed' : 'upcoming';
}

export function eventStatus(given: TimelineStatus | undefined): TimelineStatus {
  return given ?? 'neutral';
}

export function isReachable({
  index,
  current,
  status,
  linear,
}: {
  index: number;
  current: number;
  status: StepStatus;
  linear: boolean;
}) {
  const behindOrNext = index <= current + 1;
  return !linear || behindOrNext || status === 'completed';
}

export function flag(on: boolean) {
  return on ? '' : undefined;
}

export function statusAttributes(status: StepStatus) {
  return {
    'data-state': status,
    'data-completed': flag(status === 'completed'),
    'data-current': flag(status === 'current'),
    'data-upcoming': flag(status === 'upcoming'),
    'data-error': flag(status === 'error'),
    'data-neutral': flag(status === 'neutral'),
  } as const;
}
