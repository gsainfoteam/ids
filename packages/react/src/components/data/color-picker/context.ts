'use client';

import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { ColorPickerState, ColorPickerSwatchOption } from '.';
import type { useInternalColorPicker } from './hooks/use-color-picker';
import type { ColorFormat } from './lib/color';
import type { colorPickerStyle } from './style';
import type { IdsSize } from '../../../tokens/types';

type Context = {
  picker: ReturnType<typeof useInternalColorPicker>;
  state: ColorPickerState;
  format: ColorFormat;
  alpha: boolean;
  swatches: ColorPickerSwatchOption[] | undefined;
  size: IdsSize;
  styles: ReturnType<typeof colorPickerStyle>;
};

export const PickerContext = createContext<Context | null>(null);

export function useInternalPicker(part: string) {
  const context = use(PickerContext);
  invariant(context, `${part} must be rendered inside ColorPicker.`);
  return context;
}

export type PickerDefaults = {
  alpha?: boolean;
  swatches?: ColorPickerSwatchOption[];
};

export const PickerDefaultsContext = createContext<PickerDefaults>({});
