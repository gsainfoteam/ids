'use client';

import { createContext, use, type KeyboardEvent } from 'react';

import { invariant } from '../../../utils';

import type { ChipColorScheme } from '.';
import type { chipStyle } from './style';
import type { ChipRemoveEvent } from './use-chip';
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

export function useChipContext(part: string) {
  const context = use(ChipContext);
  invariant(context, `\`<${part}>\` must be used inside \`<Chip>\`.`);
  return context;
}
