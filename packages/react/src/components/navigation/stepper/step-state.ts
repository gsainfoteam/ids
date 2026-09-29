export type StepperStatus = 'completed' | 'current' | 'upcoming' | 'error';

export function stepStatus(
  index: number,
  current: number,
  marks: { completed?: boolean; error?: boolean },
): StepperStatus {
  if (marks.error === true) return 'error';
  if (index === current) return 'current';
  if (marks.completed ?? index < current) return 'completed';
  return 'upcoming';
}

export function isReachable({
  index,
  current,
  status,
  linear,
}: {
  index: number;
  current: number;
  status: StepperStatus;
  linear: boolean;
}) {
  const behindOrNext = index <= current + 1;
  return !linear || behindOrNext || status === 'completed';
}

export function flag(on: boolean) {
  return on ? '' : undefined;
}

export function statusAttributes(status: StepperStatus) {
  return {
    'data-state': status,
    'data-completed': flag(status === 'completed'),
    'data-current': flag(status === 'current'),
    'data-upcoming': flag(status === 'upcoming'),
    'data-error': flag(status === 'error'),
  } as const;
}
