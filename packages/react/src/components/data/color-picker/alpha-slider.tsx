'use client';

import { cssColor } from './color';
import { usePicker } from './context';
import { CHECKER, GRADIENT_DIRECTION, overChecker } from './gradient';
import { useTranslate } from '../../../internal/translate';
import { Slider } from '../../form/slider';

import type { ColorPicker } from '.';

export function ColorPickerAlphaSlider({ className, ...props }: ColorPicker.SliderProps) {
  const t = useTranslate();

  const c = usePicker('ColorPicker.AlphaSlider');
  if (!c.alpha) return null;
  const { color, rgba } = c.picker.state;
  return (
    <Slider
      {...props}
      dir={GRADIENT_DIRECTION}
      data-color-picker-alpha=""
      min={0}
      max={100}
      largeStep={10}
      value={Math.round(color.a * 100)}
      onValueChange={(percent) => c.picker.actions.setChannel('alpha', percent)}
      formatLabel={(value: number) => t('colorPicker.percent', { value })}
      valueLabel="never"
      aria-label={props['aria-label'] ?? t('colorPicker.alpha')}
      size={c.size}
      disabled={c.state.disabled}
      readOnly={c.state.readOnly}
      className={c.styles.slider({ className })}
    >
      <Slider.Track
        style={{
          backgroundImage: `linear-gradient(to right, transparent, ${cssColor({ ...rgba, alpha: 1 })}), ${CHECKER}`,
          backgroundSize: '100% 100%, 8px 8px',
        }}
      >
        <Slider.Thumb style={overChecker(cssColor(rgba))} />
      </Slider.Track>
    </Slider>
  );
}

ColorPickerAlphaSlider.displayName = 'ColorPicker.AlphaSlider';
