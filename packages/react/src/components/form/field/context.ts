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

// Controls that change their own DOM value without an input event (a react-hook-form setValue
// caught by a value observer) call this so the Field's filled and dirty state follow.
export const FieldNotifyContext = createContext<(() => void) | null>(null);

/** Explicit control sizes take priority over the containing Field. */
export function useFieldSize(size?: IdsSize) {
  const inherited = useContext(FieldSizeContext);
  return size ?? inherited;
}

export function useFieldState() {
  return useContext(FieldStateContext);
}
