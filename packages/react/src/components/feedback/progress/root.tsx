'use client';

import { isValidElement, useId, type ReactElement, type ReactNode } from 'react';

import { ProgressContext } from './context';
import { ProgressIndicator } from './indicator';
import { ProgressLabel } from './label';
import { resolve } from './part-props';
import { progressStyle } from './style';
import { ProgressTrack } from './track';
import { useProgress } from './use-progress';
import { elementTypeOf, flattenFragments } from '../../../utils';

import type { Progress } from '.';

function isPart(node: ReactNode, part: unknown): node is ReactElement<Record<string, unknown>> {
  return isValidElement(node) && elementTypeOf(node) === part;
}

export function ProgressRoot({
  value,
  max = 100,
  indeterminate = false,
  shape = 'linear',
  size = 'standard',
  colorScheme = 'primary',
  getValueLabel,
  className,
  style,
  children,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  'aria-valuetext': ariaValueText,
  ...rest
}: Progress.Props) {
  const generatedId = useId();
  const nodes = flattenFragments(children);
  const label = nodes.find((node) => isPart(node, ProgressLabel));
  const labelId =
    (isValidElement<{ id?: string }>(label) ? label.props.id : undefined) ?? `${generatedId}-label`;

  const progress = useProgress({
    value,
    max,
    indeterminate,
    getValueLabel,
    labelled: ariaLabel !== undefined || ariaLabelledBy !== undefined || label !== undefined,
  });
  const state: Progress.State = { ...progress, shape, size, colorScheme };
  const styles = progressStyle({ shape, size, colorScheme, indeterminate: state.indeterminate });

  const progressbar = {
    role: 'progressbar',
    id,
    'aria-label': ariaLabel,
    'aria-labelledby':
      ariaLabelledBy ?? (ariaLabel === undefined && label !== undefined ? labelId : undefined),
    'aria-describedby': ariaDescribedBy,
    'aria-valuemin': 0,
    'aria-valuemax': state.max,
    'aria-valuenow': state.value ?? undefined,
    'aria-valuetext': ariaValueText ?? state.valueLabel,
  };

  const root = {
    ...rest,
    'data-progress': '',
    'data-shape': shape,
    'data-size': size,
    'data-indeterminate': state.indeterminate ? '' : undefined,
    'data-complete': state.complete ? '' : undefined,
    className: styles.root({ className: resolve(className, state) }),
    style: resolve(style, state),
  };

  const trackIndex = nodes.findIndex((node) => isPart(node, ProgressTrack));
  const indicator = nodes.find((node) => isPart(node, ProgressIndicator));
  const content = nodes.filter(
    (node) => !isPart(node, ProgressTrack) && !isPart(node, ProgressIndicator),
  );
  const contentBefore = (index: number) =>
    nodes.slice(0, index).filter((node) => content.includes(node)).length;

  const context = { state, styles, labelId, progressbar };

  if (shape === 'circular') {
    const center = content.filter((node) => !isPart(node, ProgressLabel));
    const labels = content.filter((node) => isPart(node, ProgressLabel));
    return (
      <ProgressContext value={context}>
        <div {...root}>
          <div {...progressbar} className={styles.circle()}>
            <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className={styles.svg()}>
              {trackIndex === -1 ? <ProgressTrack /> : nodes[trackIndex]}
              {indicator ?? <ProgressIndicator />}
            </svg>
            {center.length > 0 && <span className={styles.center()}>{center}</span>}
          </div>
          {labels}
        </div>
      </ProgressContext>
    );
  }

  const leading = trackIndex === -1 ? content : content.slice(0, contentBefore(trackIndex));
  const trailing = trackIndex === -1 ? [] : content.slice(contentBefore(trackIndex));
  const track = trackIndex === -1 ? <ProgressTrack>{indicator}</ProgressTrack> : nodes[trackIndex];

  return (
    <ProgressContext value={context}>
      <div {...root}>
        {leading.length > 0 && <div className={styles.header()}>{leading}</div>}
        {track}
        {trailing.length > 0 && <div className={styles.header()}>{trailing}</div>}
      </div>
    </ProgressContext>
  );
}
