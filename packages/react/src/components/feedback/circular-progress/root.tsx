'use client';

import { CircularProgressContext } from './context';
import { CircularProgressIndicator } from './indicator';
import { CircularProgressLabel } from './label';
import { circularProgressStyle } from './style';
import { CircularProgressTrack } from './track';
import { resolve } from '../progress/part-props';
import { isPart, useProgressRoot } from '../progress/use-progress';

import type { CircularProgress } from '.';

export function CircularProgressRoot({
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
}: CircularProgress.Props) {
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
    'CircularProgress',
    CircularProgressLabel,
  );
  const state: CircularProgress.State = { ...progress, size, colorScheme };
  const styles = circularProgressStyle({ size, colorScheme, indeterminate: state.indeterminate });

  const track = nodes.find((node) => isPart(node, CircularProgressTrack));
  const indicator = nodes.find((node) => isPart(node, CircularProgressIndicator));
  const labels = nodes.filter((node) => isPart(node, CircularProgressLabel));
  const center = nodes.filter(
    (node) =>
      !isPart(node, CircularProgressTrack) &&
      !isPart(node, CircularProgressIndicator) &&
      !isPart(node, CircularProgressLabel),
  );

  return (
    <CircularProgressContext value={{ state, styles, labelId }}>
      <div
        {...rest}
        data-circular-progress=""
        data-size={size}
        data-indeterminate={state.indeterminate ? '' : undefined}
        data-complete={state.complete ? '' : undefined}
        className={styles.root({ className: resolve(className, state) })}
        style={resolve(style, state)}
      >
        <div {...progressbar} className={styles.circle()}>
          <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className={styles.svg()}>
            {track ?? <CircularProgressTrack />}
            {indicator ?? <CircularProgressIndicator />}
          </svg>
          {center.length > 0 && <span className={styles.center()}>{center}</span>}
        </div>
        {labels}
      </div>
    </CircularProgressContext>
  );
}
