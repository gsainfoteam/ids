import { SliderRange, type SliderRangeProps } from './range';
import {
  SliderRoot,
  type SliderOrientation,
  type SliderState,
  type SliderThumbState,
  type SliderProps,
} from './root';
import { sliderStyle } from './style';
import { SliderThumb, type SliderThumbProps } from './thumb';
import { SliderTrack, type SliderTrackProps } from './track';
import { type SliderValue } from './use-slider';

export function Slider(props: SliderProps) {
  return <SliderRoot {...props} />;
}

export namespace Slider {
  export type Props = SliderProps;
  export type State = SliderState;
  export type ThumbState = SliderThumbState;
  export type Value = SliderValue;
  export type Orientation = SliderOrientation;

  export type TrackProps = SliderTrackProps;
  export type RangeProps = SliderRangeProps;
  export type ThumbProps = SliderThumbProps;

  export const Track = SliderTrack;
  export namespace Track {
    export type Props = TrackProps;
  }

  export const Range = SliderRange;
  export namespace Range {
    export type Props = RangeProps;
  }

  export const Thumb = SliderThumb;
  export namespace Thumb {
    export type Props = ThumbProps;
  }

  export const Style = sliderStyle;
}

export type {
  SliderOrientation,
  SliderValueLabel,
  SliderState,
  SliderThumbState,
  SliderProps,
} from './root';
export type { SliderValue } from './use-slider';
