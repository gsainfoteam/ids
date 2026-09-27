import { clamp } from 'es-toolkit';
export type ResolvedProgress = {
  value: number | null;
  max: number;
  percent: number | null;
};

const DEFAULT_MAX = 100;

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
