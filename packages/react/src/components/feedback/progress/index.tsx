'use client';

import {
  isValidElement,
  useId,
  type ComponentProps,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';

import { ProgressContext } from './context';
import { ProgressIndicator, type ProgressIndicatorProps } from './indicator';
import { ProgressLabel, type ProgressLabelProps } from './label';
import { resolve } from './part-props';
import { progressStyle } from './style';
import { ProgressTrack, type ProgressTrackProps } from './track';
import { useProgress } from './use-progress';
import { ProgressValue, type ProgressValueProps } from './value';
import { flattenFragments } from '../../../utils';

import type { IdsSize } from '../../../tokens/types';

function isPart(node: ReactNode, part: unknown): node is ReactElement<Record<string, unknown>> {
  return isValidElement(node) && node.type === part;
}

export function Progress({
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

export namespace Progress {
  export type Shape = 'linear' | 'circular';
  export type ColorScheme = 'primary' | 'neutral' | 'info' | 'success' | 'warning' | 'danger';

  export type State = {
    value: number | null;
    max: number;
    percent: number | null;
    valueLabel: string | undefined;
    indeterminate: boolean;
    complete: boolean;
    shape: Shape;
    size: IdsSize;
    colorScheme: ColorScheme;
  };

  export type Props = Omit<
    ComponentProps<'div'>,
    'children' | 'className' | 'style' | 'role' | 'defaultValue'
  > & {
    value?: number | null;
    max?: number;
    indeterminate?: boolean;
    shape?: Shape;
    size?: IdsSize;
    colorScheme?: ColorScheme;
    getValueLabel?: (value: number, max: number) => string;
    className?: string | ((state: State) => string | undefined);
    style?: CSSProperties | ((state: State) => CSSProperties | undefined);
    children?: ReactNode;
  };

  export const Label = ProgressLabel;
  export namespace Label {
    export type Props = ProgressLabelProps;
  }

  export const Value = ProgressValue;
  export namespace Value {
    export type Props = ProgressValueProps;
  }

  export const Track = ProgressTrack;
  export namespace Track {
    export type Props = ProgressTrackProps;
  }

  export const Indicator = ProgressIndicator;
  export namespace Indicator {
    export type Props = ProgressIndicatorProps;
  }

  export const Style = progressStyle;
}
