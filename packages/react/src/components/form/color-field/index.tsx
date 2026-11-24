import { ColorFieldClear, type ColorFieldClearProps } from './parts/clear';
import { ColorFieldContent, type ColorFieldContentProps } from './parts/content';
import { ColorFieldSwatch, type ColorFieldSwatchProps } from './parts/swatch';
import { ColorFieldTrigger, type ColorFieldTriggerProps } from './parts/trigger';
import { ColorFieldValue, type ColorFieldValueProps } from './parts/value';
import {
  ColorFieldRoot,
  type ColorFieldVariant,
  type ColorFieldState,
  type ColorFieldProps,
} from './root';
import { colorFieldStyle } from './style';

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
export type { ColorFormat } from '../../data/color-picker/lib/color';
