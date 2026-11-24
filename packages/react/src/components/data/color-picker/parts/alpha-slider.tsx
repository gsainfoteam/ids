'use client';

import { use, useEffect } from 'react';

import { useInternalIntlWords, useInternalTranslate } from '../../../../internal/translate';
import { isDevelopment } from '../../../../utils/dev';
import { Slider } from '../../../form/slider';
import { PickerDefaultsContext, useInternalPicker } from '../context';
import { cssColor } from '../lib/color';
import { CHECKER, GRADIENT_DIRECTION, overChecker } from '../lib/gradient';

import type { ColorPicker } from '..';

export function ColorPickerAlphaSlider({ className, ...props }: ColorPicker.SliderProps) {
  const t = useInternalTranslate();
  const words = useInternalIntlWords();

  const c = useInternalPicker('ColorPicker.AlphaSlider');
  const hiddenFromTheRoot = !c.alpha && use(PickerDefaultsContext).alpha === undefined;

  useEffect(() => {
    if (!isDevelopment || !hiddenFromTheRoot) return;
    console.warn(
      '[IDS] ColorPicker.AlphaSlider: ColorPicker turns the alpha channel on when it finds an AlphaSlider among its children, and it cannot see one rendered inside your own component. Write <ColorPicker.AlphaSlider /> in the JSX under <ColorPicker>.',
    );
  }, [hiddenFromTheRoot]);

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
      formatLabel={words.percent}
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
        <Slider.Thumb style={overChecker(cssColor(rgba))}>{null}</Slider.Thumb>
      </Slider.Track>
    </Slider>
  );
}

ColorPickerAlphaSlider.displayName = 'ColorPicker.AlphaSlider';
