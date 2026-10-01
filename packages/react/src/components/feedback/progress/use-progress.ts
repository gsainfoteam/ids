'use client';

import { useEffect } from 'react';

import { describeProblem, formatPercent, resolveProgress } from './progress-value';
import { isDevelopment } from '../../../utils/dev';

export type UseProgressOptions = {
  value: number | null | undefined;
  max: number;
  indeterminate: boolean;
  getValueLabel: ((value: number, max: number) => string) | undefined;
  labelled: boolean;
};

export function useProgress({
  value,
  max,
  indeterminate,
  getValueLabel,
  labelled,
}: UseProgressOptions) {
  const resolved = resolveProgress(value, max, indeterminate);
  const valueLabel =
    resolved.value === null || resolved.percent === null
      ? undefined
      : getValueLabel
        ? getValueLabel(resolved.value, resolved.max)
        : formatPercent(resolved.percent);

  useEffect(() => {
    if (!isDevelopment) return;
    const problem = describeProblem(value, max);
    if (problem) console.warn(`[IDS] Progress: ${problem}`);
  }, [value, max]);

  useEffect(() => {
    if (!isDevelopment || labelled) return;
    console.warn('[IDS] Progress: add a Progress.Label or an aria-label so it has a name.');
  }, [labelled]);

  return {
    value: resolved.value,
    max: resolved.max,
    percent: resolved.percent,
    valueLabel,
    indeterminate: resolved.value === null,
    complete: resolved.value !== null && resolved.value >= resolved.max,
  };
}
