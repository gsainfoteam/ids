'use client';

import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { SelectItemState, SelectState } from '.';
import type { useInternalSelect } from './hooks/use-select';
import type { SelectOption } from './lib/select-options';
import type { selectStyle } from './style';
import type { IdsSize } from '../../../tokens/types';

type SelectContextValue = {
  select: ReturnType<typeof useInternalSelect>;
  options: SelectOption[];
  state: SelectState;
  placeholder: string;
  triggerProps: Record<string, unknown>;
  listLabel: { 'aria-label'?: string; 'aria-labelledby'?: string };
  size: IdsSize;
  styles: ReturnType<typeof selectStyle>;
};

export const SelectContext = createContext<SelectContextValue | null>(null);
export const ItemContext = createContext<SelectItemState | null>(null);

export function useInternalSelectContext(part: string) {
  const context = use(SelectContext);
  invariant(context, `${part} must be rendered inside Select.`);

  return context;
}
