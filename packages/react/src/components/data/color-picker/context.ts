import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { ColorPickerState, ColorPickerSwatchOption } from '.';
import type { ColorFormat } from './color';
import type { colorPickerStyle } from './style';
import type { useColorPicker } from './use-color-picker';
import type { IdsSize } from '../../../tokens/types';

type Context = {
  picker: ReturnType<typeof useColorPicker>;
  state: ColorPickerState;
  format: ColorFormat;
  alpha: boolean;
  swatches: ColorPickerSwatchOption[] | undefined;
  size: IdsSize;
  styles: ReturnType<typeof colorPickerStyle>;
};

export const PickerContext = createContext<Context | null>(null);

export function usePicker(part: string) {
  const context = use(PickerContext);
  invariant(context, `${part} must be rendered inside ColorPicker.`);
  return context;
}
