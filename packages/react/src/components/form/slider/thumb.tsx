'use client';

import { SliderThumbContext, useSliderContext } from './context';
import { Part, type SliderPartProps } from './part';
import { percentOf, position, thumbOffset } from './slider-math';
import { resolve } from './state-prop';
import { SliderValueLabel } from './value-label';
import { invariant, mergeProps } from '../../../utils';

import type { SliderThumbState } from '.';

export type SliderThumbProps = SliderPartProps<SliderThumbState> & { index?: number };

export function SliderThumb({
  index = 0,
  asChild,
  className,
  style,
  children,
  ...props
}: SliderThumbProps) {
  const { state, styles, min, max, dragging, thumbProps } = useSliderContext('Slider.Thumb');
  invariant(
    index >= 0 && index < state.values.length,
    `Slider.Thumb: index ${index} has no value; a range slider has thumbs 0 and 1.`,
  );

  const thumbValue = state.values[index]!;
  const thumbState: SliderThumbState = {
    ...state,
    index,
    thumbValue,
    thumbDragging: dragging === index,
  };
  const content = children === undefined ? <SliderValueLabel /> : resolve(children, thumbState);

  return (
    <SliderThumbContext.Provider value={thumbState}>
      <Part
        asChild={asChild}
        props={mergeProps(
          {
            ...thumbProps(index),
            className: styles.thumb(),
            style: position(state.orientation, thumbOffset(percentOf(thumbValue, min, max))),
          },
          {
            ...props,
            className: resolve(className, thumbState),
            style: resolve(style, thumbState),
          },
        )}
      >
        {content}
      </Part>
    </SliderThumbContext.Provider>
  );
}

SliderThumb.displayName = 'Slider.Thumb';
