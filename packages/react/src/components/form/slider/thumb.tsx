'use client';

import { useSliderContext } from './context';
import { Part, type SliderPartProps } from './part';
import { percentOf, position, thumbOffset } from './slider-math';
import { resolve } from './state-prop';
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
  const { state, styles, min, max, dragging, formatLabel, valueLabel, thumbProps } =
    useSliderContext('Slider.Thumb');
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
  const label =
    valueLabel === 'never' ? null : (
      <span
        aria-hidden="true"
        data-visible={valueLabel === 'always' ? '' : undefined}
        className={styles.valueLabel()}
      >
        {formatLabel?.(thumbValue) ?? thumbValue}
      </span>
    );
  const content = resolve(children, thumbState) ?? label;

  return (
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
  );
}

SliderThumb.displayName = 'Slider.Thumb';
