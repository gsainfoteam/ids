import { CircularProgressIndicator, type CircularProgressIndicatorProps } from './parts/indicator';
import { CircularProgressLabel, type CircularProgressLabelProps } from './parts/label';
import { CircularProgressTrack, type CircularProgressTrackProps } from './parts/track';
import { CircularProgressValue, type CircularProgressValueProps } from './parts/value';
import { CircularProgressRoot } from './root';
import { circularProgressStyle } from './style';

import type { Progress } from '../progress';

export function CircularProgress(props: CircularProgress.Props) {
  return <CircularProgressRoot {...props} />;
}

export namespace CircularProgress {
  export type ColorScheme = Progress.ColorScheme;
  export type State = Progress.State;
  export type Props = Progress.Props;

  export const Label = CircularProgressLabel;
  export namespace Label {
    export type Props = CircularProgressLabelProps;
  }

  export const Value = CircularProgressValue;
  export namespace Value {
    export type Props = CircularProgressValueProps;
  }

  export const Track = CircularProgressTrack;
  export namespace Track {
    export type Props = CircularProgressTrackProps;
  }

  export const Indicator = CircularProgressIndicator;
  export namespace Indicator {
    export type Props = CircularProgressIndicatorProps;
  }

  export const Style = circularProgressStyle;
}
