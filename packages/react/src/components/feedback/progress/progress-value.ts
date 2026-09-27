import { clamp } from 'es-toolkit';
export type ResolvedProgress = {
  value: number | null;
  max: number;
  percent: number | null;
};

const DEFAULT_MAX = 100;

// Upload byte counts overshoot their total and float sums land on 100.0000001, so a value out of
// range is clamped instead of thrown on. Anything that cannot be drawn becomes indeterminate.
export function resolveProgress(
  value: number | null | undefined,
  max: number,
  indeterminate: boolean,
): ResolvedProgress {
  const validMax = Number.isFinite(max) && max > 0;
  const safeMax = validMax ? max : DEFAULT_MAX;
  if (indeterminate || value == null || !validMax || !Number.isFinite(value))
    return { value: null, max: safeMax, percent: null };
  const clamped = clamp(value, 0, safeMax);
  return { value: clamped, max: safeMax, percent: (clamped / safeMax) * 100 };
}

// Rounded down, so 99.6% reads 99% and 100% only ever means done.
export function formatPercent(percent: number) {
  return `${Math.floor(percent)}%`;
}

export function describeProblem(value: number | null | undefined, max: number) {
  if (!Number.isFinite(max) || max <= 0)
    return `max must be a positive number, got ${max}. It renders as indeterminate.`;
  if (value == null) return null;
  if (!Number.isFinite(value)) return `value must be a finite number, got ${value}.`;
  if (value < 0 || value > max) return `value ${value} is outside 0..${max} and is clamped.`;
  return null;
}
