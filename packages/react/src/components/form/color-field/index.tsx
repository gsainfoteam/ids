import { ColorFieldClear, type ColorFieldClearProps } from './clear';
import { ColorFieldContent, type ColorFieldContentProps } from './content';
import {
  ColorFieldRoot,
  type ColorFieldVariant,
  type ColorFieldState,
  type ColorFieldProps,
} from './root';
import { colorFieldStyle } from './style';
import { ColorFieldSwatch, type ColorFieldSwatchProps } from './swatch';
import { ColorFieldTrigger, type ColorFieldTriggerProps } from './trigger';
import { ColorFieldValue, type ColorFieldValueProps } from './value';

export function ColorField(props: ColorFieldProps) {
  return <ColorFieldRoot {...props} />;
}

export namespace ColorField {
  export type Props = ColorFieldProps;
  export type State = ColorFieldState;
  export type Variant = ColorFieldVariant;
  export type TriggerProps = ColorFieldTriggerProps;
  export type SwatchProps = ColorFieldSwatchProps;
  export type ValueProps = ColorFieldValueProps;
  export type ClearProps = ColorFieldClearProps;
  export type ContentProps = ColorFieldContentProps;

  export const Trigger = ColorFieldTrigger;
  export const Swatch = ColorFieldSwatch;
  export const Value = ColorFieldValue;
  export const Clear = ColorFieldClear;
  export const Content = ColorFieldContent;

  export const Style = colorFieldStyle;
}

export type { ColorFieldVariant, ColorFieldState, ColorFieldProps } from './root';
export type { ColorFormat } from '../../data/color-picker/color';
