'use client';

import { ProgressContext } from './context';
import { ProgressIndicator } from './indicator';
import { ProgressLabel } from './label';
import { resolve } from './part-props';
import { progressStyle } from './style';
import { ProgressTrack } from './track';
import { isPart, useProgressRoot } from './use-progress';

import type { Progress } from '.';

export function ProgressRoot({
  value,
  max,
  indeterminate,
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
  const { progress, nodes, labelId, progressbar } = useProgressRoot(
    {
      value,
      max,
      indeterminate,
      getValueLabel,
      id,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'aria-describedby': ariaDescribedBy,
      'aria-valuetext': ariaValueText,
      children,
    },
    'Progress',
    ProgressLabel,
  );
  const state: Progress.State = { ...progress, size, colorScheme };
  const styles = progressStyle({ size, colorScheme, indeterminate: state.indeterminate });

  const trackIndex = nodes.findIndex((node) => isPart(node, ProgressTrack));
  const indicator = nodes.find((node) => isPart(node, ProgressIndicator));
  const content = nodes.filter(
    (node) => !isPart(node, ProgressTrack) && !isPart(node, ProgressIndicator),
  );
  const contentBefore = (index: number) =>
    nodes.slice(0, index).filter((node) => content.includes(node)).length;

  const leading = trackIndex === -1 ? content : content.slice(0, contentBefore(trackIndex));
  const trailing = trackIndex === -1 ? [] : content.slice(contentBefore(trackIndex));
  const track = trackIndex === -1 ? <ProgressTrack>{indicator}</ProgressTrack> : nodes[trackIndex];

  return (
    <ProgressContext value={{ state, styles, labelId, progressbar }}>
      <div
        {...rest}
        data-progress=""
        data-size={size}
        data-indeterminate={state.indeterminate ? '' : undefined}
        data-complete={state.complete ? '' : undefined}
        className={styles.root({ className: resolve(className, state) })}
        style={resolve(style, state)}
      >
        {leading.length > 0 && <div className={styles.header()}>{leading}</div>}
        {track}
        {trailing.length > 0 && <div className={styles.header()}>{trailing}</div>}
      </div>
    </ProgressContext>
  );
}
