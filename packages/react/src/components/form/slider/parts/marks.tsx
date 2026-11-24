'use client';

import { useInternalSliderContext } from '../context';
import { SliderMark } from './mark';
import { Part, type SliderPartProps } from './part';
import { stepMarks } from '../lib/slider-math';
import { resolve } from '../lib/state-prop';

export type SliderMarksProps = SliderPartProps;

export function SliderMarks({ asChild, className, style, children, ...props }: SliderMarksProps) {
  const { state, styles, min, max, step } = useInternalSliderContext('Slider.Marks');
  const content =
    resolve(children, state) ??
    stepMarks(min, max, step).map((mark) => (
      <SliderMark key={mark} value={mark}>
        {null}
      </SliderMark>
    ));

  return (
    <Part
      asChild={asChild}
      props={{
        ...props,
        'aria-hidden': true,
        'data-orientation': state.orientation,
        className: styles.marks({ className: resolve(className, state) }),
        style: resolve(style, state),
      }}
    >
      {content}
    </Part>
  );
}

SliderMarks.displayName = 'Slider.Marks';
