import { type ComponentProps, type CSSProperties, type ReactNode } from 'react';

import { ProgressIndicator, type ProgressIndicatorProps } from './indicator';
import { ProgressLabel, type ProgressLabelProps } from './label';
import { ProgressRoot } from './root';
import { progressStyle } from './style';
import { ProgressTrack, type ProgressTrackProps } from './track';
import { ProgressValue, type ProgressValueProps } from './value';

import type { IdsSize } from '../../../tokens/types';

export function Progress(props: Progress.Props) {
  return <ProgressRoot {...props} />;
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
