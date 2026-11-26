import { type SliderInstance, type UseSliderOptions } from './hooks/use-slider';
import { type SliderValue } from './hooks/use-slider-state';
import { SliderMark, type SliderMarkProps } from './parts/mark';
import { SliderMarks, type SliderMarksProps } from './parts/marks';
import { SliderRange, type SliderRangeProps } from './parts/range';
import { SliderThumb, type SliderThumbProps } from './parts/thumb';
import { SliderTrack, type SliderTrackProps } from './parts/track';
import { SliderValueLabel, type SliderValueLabelProps } from './parts/value-label';
import {
  SliderRoot,
  type SliderOrientation,
  type SliderState,
  type SliderThumbState,
  type SliderProps,
} from './root';
import { sliderStyle } from './style';

export function Slider<V extends SliderValue = number>(props: SliderProps<V>) {
  return <SliderRoot {...props} />;
}

export namespace Slider {
  export type Props<V extends SliderValue = SliderValue> = SliderProps<V>;
  export type State = SliderState;
  export type ThumbState = SliderThumbState;
  export type Value = SliderValue;
  export type Orientation = SliderOrientation;
  export type Instance = SliderInstance;
  export type Options = UseSliderOptions;

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
export type { SliderValue } from './hooks/use-slider-state';
export { useSlider } from './hooks/use-slider';
export type { SliderInstance, UseSliderOptions } from './hooks/use-slider';
