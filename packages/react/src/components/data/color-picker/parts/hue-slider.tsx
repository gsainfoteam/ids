'use client';

import { useInternalIntlWords, useInternalTranslate } from '../../../../internal/translate';
import { Slider, useSlider } from '../../../form/slider';
import { useInternalPicker } from '../context';
import { GRADIENT_DIRECTION } from '../lib/gradient';

import type { ColorPicker } from '..';

const HUES = 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)';

export function ColorPickerHueSlider({ className, ...props }: ColorPicker.SliderProps) {
  const t = useInternalTranslate();
  const words = useInternalIntlWords();
  const slider = useSlider({ largeStep: 10, formatLabel: words.degrees });

  const c = useInternalPicker('ColorPicker.HueSlider');
  const { color } = c.picker.state;
  return (
    <Slider
      {...props}
      dir={GRADIENT_DIRECTION}
      data-color-picker-hue=""
      slider={slider}
      min={0}
      max={360}
      value={Math.round(color.h)}
      onValueChange={(hue) => c.picker.actions.setChannel('hue', hue)}
      aria-label={props['aria-label'] ?? t('colorPicker.hue')}
      size={c.size}
      disabled={c.state.disabled}
      readOnly={c.state.readOnly}
      className={c.styles.slider({ className })}
    >
      <Slider.Track style={{ backgroundImage: HUES }}>
        <Slider.Thumb style={{ backgroundColor: `hsl(${color.h} 100% 50%)` }}>{null}</Slider.Thumb>
      </Slider.Track>
    </Slider>
  );
}

ColorPickerHueSlider.displayName = 'ColorPicker.HueSlider';
