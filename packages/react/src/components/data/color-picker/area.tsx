'use client';

import { type ComponentProps } from 'react';

import { cssColor } from './color';
import { usePicker } from './context';
import { GRADIENT_DIRECTION } from './gradient';
import { useTranslate } from '../../../internal/translate';
import { mergeProps } from '../../../utils';

export type ColorPickerAreaProps = Omit<ComponentProps<'div'>, 'children'>;

export function ColorPickerArea({ className, style, ...props }: ColorPickerAreaProps) {
  const t = useTranslate();

  const c = usePicker('ColorPicker.Area');
  const { color, rgba } = c.picker.state;
  const saturation = Math.round(color.s * 100);
  const brightness = Math.round(color.v * 100);
  const valueText = t('colorPicker.areaValue', { saturation, brightness });
  const channel = {
    type: 'range',
    min: 0,
    max: 100,
    step: 1,
    'aria-valuetext': valueText,
    'aria-roledescription': t('colorPicker.twoD'),
    'aria-readonly': c.state.readOnly || undefined,
    disabled: c.state.disabled,
    className: c.styles.channel(),
    onKeyDown: c.picker.area.onKeyDown,
  } as const;
  return (
    <div
      {...mergeProps(props, {
        onPointerDown: c.picker.area.onPointerDown,
        onPointerMove: c.picker.area.onPointerMove,
      })}
      role="group"
      aria-label={props['aria-label'] ?? t('colorPicker.area')}
      dir={GRADIENT_DIRECTION}
      data-color-picker-area=""
      data-disabled={c.state.disabled ? '' : undefined}
      className={c.styles.area({ className })}
      style={{
        ...style,
        backgroundColor: `hsl(${color.h} 100% 50%)`,
        backgroundImage:
          'linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)',
      }}
    >
      <span
        aria-hidden="true"
        className={c.styles.areaThumb()}
        style={{
          left: `${color.s * 100}%`,
          top: `${(1 - color.v) * 100}%`,
          backgroundColor: cssColor({ ...rgba, alpha: 1 }),
        }}
      />
      <input
        {...channel}
        aria-label={t('colorPicker.saturation')}
        value={saturation}
        onChange={(event) => c.picker.actions.onChannelChange('saturation', event)}
      />
      <input
        {...channel}
        aria-label={t('colorPicker.brightness')}
        aria-orientation="vertical"
        tabIndex={-1}
        value={brightness}
        onChange={(event) => c.picker.actions.onChannelChange('brightness', event)}
      />
    </div>
  );
}

ColorPickerArea.displayName = 'ColorPicker.Area';
