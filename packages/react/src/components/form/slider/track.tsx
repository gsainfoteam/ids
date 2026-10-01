'use client';

import { useSliderContext } from './context';
import { Part, type SliderPartProps } from './part';
import { SliderRange } from './range';
import { resolve } from './state-prop';
import { SliderThumb } from './thumb';

export type SliderTrackProps = SliderPartProps;

export function SliderTrack({ asChild, className, style, children, ...props }: SliderTrackProps) {
  const { state, styles, range, setTrack } = useSliderContext('Slider.Track');
  const content = resolve(children, state) ?? (
    <>
      <SliderRange />
      <SliderThumb index={0} />
      {range && <SliderThumb index={1} />}
    </>
  );

  return (
    <Part
      asChild={asChild}
      props={{
        ...props,
        ref: setTrack,
        'data-orientation': state.orientation,
        'data-disabled': state.disabled ? '' : undefined,
        className: styles.track({ className: resolve(className, state) }),
        style: resolve(style, state),
      }}
    >
      {content}
    </Part>
  );
}

SliderTrack.displayName = 'Slider.Track';
