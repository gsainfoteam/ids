'use client';

import { useInternalSliderContext } from '../context';
import { Part, type SliderPartProps } from './part';
import { percentOf, position, thumbOffset } from '../lib/slider-math';
import { resolve } from '../lib/state-prop';

export type SliderMarkProps = SliderPartProps & { value: number };

export function SliderMark({
  value,
  asChild,
  className,
  style,
  children,
  ...props
}: SliderMarkProps) {
  const { state, styles, min, max, formatLabel } = useInternalSliderContext('Slider.Mark');
  const label =
    children === undefined ? (formatLabel?.(value) ?? String(value)) : resolve(children, state);

  return (
    <Part
      asChild={asChild}
      props={{
        ...props,
        'data-value': value,
        className: styles.mark({ className: resolve(className, state) }),
        style: {
          ...position(state.orientation, thumbOffset(percentOf(value, min, max))),
          ...resolve(style, state),
        },
      }}
    >
      <span className={styles.tick()} />
      {label}
    </Part>
  );
}

SliderMark.displayName = 'Slider.Mark';
