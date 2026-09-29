import { createContext, use, useContext, type ReactNode } from 'react';

import { invariant } from '../../../utils';

import type { FieldValidity } from './control-state';
import type { fieldStyle } from './style';
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

export type FieldContextValue = {
  controlId: string;
  state: FieldState;
  errorMessage: ReactNode;
  validity: FieldValidity | null;
  styles: ReturnType<typeof fieldStyle>;
};

export const FieldContext = createContext<FieldContextValue | null>(null);

export function useFieldContext(name: string) {
  const context = use(FieldContext);
  invariant(context, `Field.${name} must be inside Field.`);
  return context;
}

export function useFieldSize(size?: IdsSize) {
  const inherited = useContext(FieldSizeContext);
  return size ?? inherited;
}

export function useFieldState() {
  return useContext(FieldStateContext);
}
