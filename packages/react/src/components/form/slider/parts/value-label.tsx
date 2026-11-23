'use client';

import { useInternalSliderContext, useInternalSliderThumbContext } from '../context';
import { Part, type SliderPartProps } from './part';
import { resolve } from '../lib/state-prop';

import type { SliderThumbState } from '..';

export type SliderValueLabelProps = SliderPartProps<SliderThumbState>;

export function SliderValueLabel({
  asChild,
  className,
  style,
  children,
  ...props
}: SliderValueLabelProps) {
  const { styles, formatLabel } = useInternalSliderContext('Slider.ValueLabel');
  const thumb = useInternalSliderThumbContext('Slider.ValueLabel');

  return (
    <Part
      asChild={asChild}
      props={{
        ...props,
        'aria-hidden': true,
        className: styles.valueLabel({ className: resolve(className, thumb) }),
        style: resolve(style, thumb),
      }}
    >
      {resolve(children, thumb) ?? formatLabel?.(thumb.thumbValue) ?? thumb.thumbValue}
    </Part>
  );
}

SliderValueLabel.displayName = 'Slider.ValueLabel';
