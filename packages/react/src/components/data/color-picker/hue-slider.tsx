'use client';

import { usePicker } from './context';
import { GRADIENT_DIRECTION } from './gradient';
import { messages } from '../../../internal/messages';
import { Slider } from '../../form/slider';

import type { ColorPicker } from '.';

const HUES = 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)';

export function ColorPickerHueSlider({ className, ...props }: ColorPicker.SliderProps) {
  const c = usePicker('ColorPicker.HueSlider');
  const { color } = c.picker.state;
  return (
    <Slider
      {...props}
      dir={GRADIENT_DIRECTION}
      data-color-picker-hue=""
      min={0}
      max={360}
      largeStep={10}
      value={Math.round(color.h)}
      onValueChange={(hue) => c.picker.actions.setChannel('hue', hue)}
      formatLabel={messages.colorPicker.hueValue}
      valueLabel="never"
      aria-label={props['aria-label'] ?? messages.colorPicker.hue}
      size={c.size}
      disabled={c.state.disabled}
      readOnly={c.state.readOnly}
      className={c.styles.slider({ className })}
    >
      <Slider.Track style={{ backgroundImage: HUES }}>
        <Slider.Thumb style={{ backgroundColor: `hsl(${color.h} 100% 50%)` }} />
      </Slider.Track>
    </Slider>
  );
}

ColorPickerHueSlider.displayName = 'ColorPicker.HueSlider';
