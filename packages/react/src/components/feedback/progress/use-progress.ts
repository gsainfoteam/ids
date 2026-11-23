'use client';

import { isValidElement, useEffect, useId, type ReactElement, type ReactNode } from 'react';

import { describeProblem, formatPercent, resolveProgress } from './progress-value';
import { elementTypeOf, flattenFragments } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';

export type ProgressOwner = 'Progress' | 'CircularProgress';

export type ProgressRootOptions = {
  value?: number | null;
  max?: number;
  indeterminate?: boolean;
  getValueLabel?: (value: number, max: number) => string;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-valuetext'?: string;
  children?: ReactNode;
};

export function isPart(
  node: ReactNode,
  part: unknown,
): node is ReactElement<Record<string, unknown>> {
  return isValidElement(node) && elementTypeOf(node) === part;
}

export function useProgressRoot(
  {
    value,
    max = 100,
    indeterminate = false,
    getValueLabel,
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    'aria-valuetext': ariaValueText,
    children,
  }: ProgressRootOptions,
  owner: ProgressOwner,
  labelPart: unknown,
) {
  const generatedId = useId();
  const nodes = flattenFragments(children);
  const label = nodes.find((node) => isPart(node, labelPart));
  const labelId =
    (isValidElement<{ id?: string }>(label) ? label.props.id : undefined) ?? `${generatedId}-label`;
  const labelled = ariaLabel !== undefined || ariaLabelledBy !== undefined || label !== undefined;

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
    if (problem) console.warn(`[IDS] ${owner}: ${problem}`);
  }, [value, max, owner]);

  useEffect(() => {
    if (!isDevelopment || labelled) return;
    console.warn(`[IDS] ${owner}: add a ${owner}.Label or an aria-label so it has a name.`);
  }, [labelled, owner]);

  const progress = {
    value: resolved.value,
    max: resolved.max,
    percent: resolved.percent,
    valueLabel,
    indeterminate: resolved.value === null,
    complete: resolved.value !== null && resolved.value >= resolved.max,
  };

  const progressbar = {
    role: 'progressbar',
    id,
    'aria-label': ariaLabel,
    'aria-labelledby':
      ariaLabelledBy ?? (ariaLabel === undefined && label !== undefined ? labelId : undefined),
    'aria-describedby': ariaDescribedBy,
    'aria-valuemin': 0,
    'aria-valuemax': progress.max,
    'aria-valuenow': progress.value ?? undefined,
    'aria-valuetext': ariaValueText ?? progress.valueLabel,
  };

  return { progress, nodes, labelId, progressbar };
}
