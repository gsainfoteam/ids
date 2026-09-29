'use client';

import { type ComponentProps, type ReactElement, type ReactNode } from 'react';

import { ColorPickerAlphaSlider } from './alpha-slider';
import { ColorPickerArea, type ColorPickerAreaProps } from './area';
import { PickerContext, usePicker } from './context';
import { ColorPickerCopy } from './copy';
import { ColorPickerEyeDropper } from './eye-dropper';
import { ColorPickerHueSlider } from './hue-slider';
import { ColorPickerInput, type ColorPickerInputProps } from './input';
import { colorPickerStyle } from './style';
import { ColorPickerSwatch, type ColorPickerSwatchProps } from './swatch';
import { ColorPickerSwatches, type ColorPickerSwatchesProps } from './swatches';
import { useColorPicker } from './use-color-picker';
import { messages } from '../../../internal/messages';
import { resolveState } from '../../../internal/state-props';
import { useFieldSize } from '../../form/field/context';

import type { ColorFormat } from './color';
import type { IdsSize } from '../../../tokens/types';

export type { ColorFormat } from './color';

export type ColorPickerSwatchOption = string | { value: string; label?: string };

export type ColorPickerState = {
  disabled: boolean;
  readOnly: boolean;
  empty: boolean;
  alpha: boolean;
};

export type ColorPickerProps = Omit<
  ComponentProps<'div'>,
  'defaultValue' | 'onChange' | 'className' | 'children'
> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  format?: ColorFormat;
  alpha?: boolean;
  swatches?: ColorPickerSwatchOption[];
  disabled?: boolean;
  readOnly?: boolean;
  size?: IdsSize;
  className?: string | ((state: ColorPickerState) => string | undefined);
  children?: ReactNode;
};

export function ColorPicker({
  value,
  defaultValue,
  onValueChange,
  format = 'hex',
  alpha = false,
  swatches,
  disabled = false,
  readOnly = false,
  size,
  className,
  children,
  ...props
}: ColorPickerProps) {
  const picker = useColorPicker({
    value,
    defaultValue,
    onValueChange,
    format,
    alpha,
    disabled,
    readOnly,
  });
  const resolvedSize = useFieldSize(size) ?? 'standard';
  const state: ColorPickerState = { disabled, readOnly, empty: !picker.state.value, alpha };
  const styles = colorPickerStyle({ size: resolvedSize, disabled });
  return (
    <PickerContext value={{ picker, state, format, alpha, swatches, size: resolvedSize, styles }}>
      <div
        role="group"
        {...props}
        aria-label={
          props['aria-label'] ?? (props['aria-labelledby'] ? undefined : messages.colorPicker.label)
        }
        data-color-picker=""
        data-size={resolvedSize}
        data-disabled={disabled ? '' : undefined}
        data-readonly={readOnly ? '' : undefined}
        data-empty={state.empty ? '' : undefined}
        className={styles.root({ className: resolveState(className, state) })}
      >
        {children ?? <DefaultLayout />}
      </div>
    </PickerContext>
  );
}

function DefaultLayout() {
  const c = usePicker('ColorPicker');
  return (
    <>
      <ColorPickerArea />
      <div className={c.styles.row()}>
        <ColorPickerEyeDropper />
        <div className={c.styles.sliders()}>
          <ColorPickerHueSlider />
          {c.alpha && <ColorPickerAlphaSlider />}
        </div>
      </div>
      <div className={c.styles.row()}>
        <ColorPickerInput />
        <ColorPickerCopy />
      </div>
      {!!c.swatches?.length && <ColorPickerSwatches />}
    </>
  );
}

export namespace ColorPicker {
  export type Props = ColorPickerProps;
  export type State = ColorPickerState;
  export type SwatchOption = ColorPickerSwatchOption;

  export type AreaProps = ColorPickerAreaProps;
  export type SliderProps = Omit<
    ComponentProps<'div'>,
    'children' | 'defaultValue' | 'onChange' | 'role'
  >;
  export type InputProps = ColorPickerInputProps;
  export type ButtonProps = Omit<ComponentProps<'button'>, 'children'> & {
    children?: ReactElement;
  };
  export type SwatchesProps = ColorPickerSwatchesProps;
  export type SwatchProps = ColorPickerSwatchProps;

  export const Area = ColorPickerArea;
  export const HueSlider = ColorPickerHueSlider;
  export const AlphaSlider = ColorPickerAlphaSlider;
  export const Input = ColorPickerInput;
  export const EyeDropper = ColorPickerEyeDropper;
  export const Copy = ColorPickerCopy;
  export const Swatches = ColorPickerSwatches;
  export const Swatch = ColorPickerSwatch;

  export const Style = colorPickerStyle;
}
