'use client';

import { createContext, use, type KeyboardEvent, type RefObject } from 'react';

import { invariant } from '../../../utils';

import type { ChipColorScheme } from '.';
import type { ChipRemoveEvent } from './hooks/use-chip';
import type { chipStyle } from './style';
import type { IdsSize } from '../../../tokens/types';

type Context = {
  styles: ReturnType<typeof chipStyle>;
  rootIsButton: boolean;
  colorScheme: ChipColorScheme;
  size: IdsSize;
  disabled: boolean;
  labelId: string | undefined;
  setLabelId: (id: string | undefined) => void;
  remove: (event: ChipRemoveEvent) => void;
  removeOnKey: (event: KeyboardEvent<HTMLElement>) => boolean;
};

export const ChipContext = createContext<Context | null>(null);
export const ChipGroupContext = createContext<{
  size: IdsSize | undefined;
  root: RefObject<HTMLElement | null>;
} | null>(null);

export function useInternalChipContext(part: string) {
  const context = use(ChipContext);
  invariant(context, `\`<${part}>\` must be used inside \`<Chip>\`.`);
  return context;
}
