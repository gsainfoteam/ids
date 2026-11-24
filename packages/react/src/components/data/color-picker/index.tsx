import { type ComponentProps, type ReactElement } from 'react';

import { ColorPickerAlphaSlider } from './parts/alpha-slider';
import { ColorPickerArea, type ColorPickerAreaProps } from './parts/area';
import { ColorPickerCopy } from './parts/copy';
import { ColorPickerEyeDropper } from './parts/eye-dropper';
import { ColorPickerHueSlider } from './parts/hue-slider';
import { ColorPickerInput, type ColorPickerInputProps } from './parts/input';
import { ColorPickerSwatch, type ColorPickerSwatchProps } from './parts/swatch';
import { ColorPickerSwatches, type ColorPickerSwatchesProps } from './parts/swatches';
import {
  ColorPickerRoot,
  type ColorPickerSwatchOption,
  type ColorPickerState,
  type ColorPickerProps,
} from './root';
import { colorPickerStyle } from './style';

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
export type { ColorFormat } from './lib/color';
