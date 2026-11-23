import { SliderMark, type SliderMarkProps } from './mark';
import { SliderMarks, type SliderMarksProps } from './marks';
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
import { SliderValueLabel, type SliderValueLabelProps } from './value-label';

export function Slider<V extends SliderValue = number>(props: SliderProps<V>) {
  return <SliderRoot {...props} />;
}

export namespace Slider {
  export type Props<V extends SliderValue = SliderValue> = SliderProps<V>;
  export type State = SliderState;
  export type ThumbState = SliderThumbState;
  export type Value = SliderValue;
  export type Orientation = SliderOrientation;

  export type TrackProps = SliderTrackProps;
  export type RangeProps = SliderRangeProps;
  export type ThumbProps = SliderThumbProps;
  export type ValueLabelProps = SliderValueLabelProps;
  export type MarksProps = SliderMarksProps;
  export type MarkProps = SliderMarkProps;

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

  export const ValueLabel = SliderValueLabel;
  export namespace ValueLabel {
    export type Props = ValueLabelProps;
  }

  export const Marks = SliderMarks;
  export namespace Marks {
    export type Props = MarksProps;
  }

  export const Mark = SliderMark;
  export namespace Mark {
    export type Props = MarkProps;
  }

  export const Style = sliderStyle;
}

export type { SliderOrientation, SliderState, SliderThumbState, SliderProps } from './root';
export type { SliderValue } from './use-slider';
