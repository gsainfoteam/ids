import { type ComponentProps, type ReactElement } from 'react';

import { ColorPickerAlphaSlider } from './alpha-slider';
import { ColorPickerArea, type ColorPickerAreaProps } from './area';
import { ColorPickerCopy } from './copy';
import { ColorPickerEyeDropper } from './eye-dropper';
import { ColorPickerHueSlider } from './hue-slider';
import { ColorPickerInput, type ColorPickerInputProps } from './input';
import {
  ColorPickerRoot,
  type ColorPickerSwatchOption,
  type ColorPickerState,
  type ColorPickerProps,
} from './root';
import { colorPickerStyle } from './style';
import { ColorPickerSwatch, type ColorPickerSwatchProps } from './swatch';
import { ColorPickerSwatches, type ColorPickerSwatchesProps } from './swatches';

export function ColorPicker(props: ColorPickerProps) {
  return <ColorPickerRoot {...props} />;
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

export type { ColorPickerSwatchOption, ColorPickerState, ColorPickerProps } from './root';
export type { ColorFormat } from './color';
