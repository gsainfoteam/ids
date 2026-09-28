import { createContext, useContext } from 'react';

import type { IdsSize } from '../../../tokens/types';

export type FieldOrientation = 'vertical' | 'horizontal';

export type FieldState = {
  orientation: FieldOrientation;
  size: IdsSize;
  invalid: boolean;
  disabled: boolean;
  required: boolean;
  filled: boolean;
  focused: boolean;
  touched: boolean;
  dirty: boolean;
};

export const FieldSizeContext = createContext<IdsSize | undefined>(undefined);

export const FieldStateContext = createContext<FieldState | null>(null);

type NotifyValueChangedWithoutInputEvent = () => void;

export const FieldNotifyContext = createContext<NotifyValueChangedWithoutInputEvent | null>(null);

export const FieldLabelContext = createContext(false);

export function useFieldSize(size?: IdsSize) {
  const inherited = useContext(FieldSizeContext);
  return size ?? inherited;
}

export function useFieldState() {
  return useContext(FieldStateContext);
}
