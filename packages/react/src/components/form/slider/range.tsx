'use client';

import { type CSSProperties } from 'react';

import { useSliderContext } from './context';
import { Part, type SliderPartProps } from './part';
import { percentOf, thumbOffset } from './slider-math';
import { resolve } from './state-prop';

export type SliderRangeProps = SliderPartProps;

export function SliderRange({ asChild, className, style, children, ...props }: SliderRangeProps) {
  const { state, styles, min, max, range } = useSliderContext('Slider.Range');

  const [first, last] = [state.values[0]!, state.values[state.values.length - 1]!];
  const start = range ? thumbOffset(percentOf(first, min, max)) : '0%';
  const end = thumbOffset(percentOf(last, min, max));
  const extent = `calc(${end} - ${start})`;
  const placement: CSSProperties =
    state.orientation === 'vertical'
      ? { bottom: start, height: extent }
      : { insetInlineStart: start, width: extent };

  return (
    <Part
      asChild={asChild}
      props={{
        ...props,
        'aria-hidden': true,
        'data-orientation': state.orientation,
        className: styles.range({ className: resolve(className, state) }),
        style: { ...placement, ...resolve(style, state) },
      }}
    >
      {resolve(children, state)}
    </Part>
  );
}

SliderRange.displayName = 'Slider.Range';
