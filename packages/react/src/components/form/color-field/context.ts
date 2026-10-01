'use client';

import { createContext, use, type ComponentProps } from 'react';

import { invariant } from '../../../utils';

import type { ColorFieldState } from '.';
import type { colorFieldStyle } from './style';
import type { useColorField } from './use-color-field';
import type { IdsSize } from '../../../tokens/types';
import type { ColorPicker } from '../../data/color-picker';

type ColorFieldContextValue = {
  field: Omit<ReturnType<typeof useColorField>, 'rootRef' | 'triggerRef'>;
  state: ColorFieldState;
  placeholder: string;
  triggerProps: Record<string, unknown>;
  valueId: string;
  picker: ComponentProps<typeof ColorPicker>;
  size: IdsSize;
  styles: ReturnType<typeof colorFieldStyle>;
};

export const ColorFieldContext = createContext<ColorFieldContextValue | null>(null);

export function useColorFieldContext(part: string) {
  const context = use(ColorFieldContext);
  invariant(context, `${part} must be rendered inside ColorField.`);
  return context;
}
