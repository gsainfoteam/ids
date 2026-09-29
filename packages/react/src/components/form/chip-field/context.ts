'use client';

import { createContext, use, type ComponentProps, type RefObject } from 'react';

import { invariant } from '../../../utils';

import type { ChipFieldInputProps, ChipFieldItemState, ChipFieldState } from '.';
import type { chipFieldStyle } from './style';
import type { useChipField } from './use-chip-field';
import type { IdsSize } from '../../../tokens/types';
import type { SelectOption } from '../select/select-options';

export type InputAttributes = Omit<ComponentProps<'input'>, 'children'>;

type ChipFieldContextValue = {
  field: Omit<ReturnType<typeof useChipField>, 'rootRef' | 'inputRef' | 'drawerInputRef'>;
  inputRef: RefObject<HTMLInputElement | null>;
  drawerInputRef: RefObject<HTMLInputElement | null>;
  options: SelectOption[];
  state: ChipFieldState;
  maxCount: number | undefined;
  drawer: boolean;
  inputProps: ChipFieldInputProps;
  inputDefaults: InputAttributes;
  comboboxWiring: InputAttributes;
  listLabel: { 'aria-label'?: string; 'aria-labelledby'?: string };
  removeLabel: (label: string) => string;
  size: IdsSize;
  styles: ReturnType<typeof chipFieldStyle>;
};

export const ChipContext = createContext<ChipFieldContextValue | null>(null);
export const ItemContext = createContext<ChipFieldItemState | null>(null);

export function useChip(name: string) {
  const context = use(ChipContext);
  invariant(context, `\`<ChipField.${name}>\` must be used inside \`<ChipField>\`.`);

  return context;
}
