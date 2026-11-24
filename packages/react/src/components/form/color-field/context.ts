'use client';

import { createContext, use, type ComponentProps } from 'react';

import { invariant } from '../../../utils';

import type { ColorFieldState } from '.';
import type { useInternalColorField } from './hooks/use-color-field';
import type { colorFieldStyle } from './style';
import type { IdsSize } from '../../../tokens/types';
import type { ColorPicker } from '../../data/color-picker';
import type { PickerDefaults } from '../../data/color-picker/context';

type ColorFieldContextValue = {
  field: Omit<ReturnType<typeof useInternalColorField>, 'rootRef' | 'triggerRef'>;
  state: ColorFieldState;
  placeholder?: string;
  triggerProps: Record<string, unknown>;
  valueId: string;
  picker: ComponentProps<typeof ColorPicker> & PickerDefaults;
  size: IdsSize;
  styles: ReturnType<typeof colorFieldStyle>;
};

export const ColorFieldContext = createContext<ColorFieldContextValue | null>(null);

export function useInternalColorFieldContext(part: string) {
  const context = use(ColorFieldContext);
  invariant(context, `${part} must be rendered inside ColorField.`);
  return context;
}
