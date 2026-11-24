'use client';

import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { ItemVariant } from './root';
import type { itemStyle } from './style';
import type { SurfaceTrigger } from '../../../internal/parts/surface-trigger';
import type { IdsSize } from '../../../tokens/types';

type Context = {
  styles: ReturnType<typeof itemStyle>;
  trigger: SurfaceTrigger | null;
  setTitleId: (id: string | undefined) => void;
  setDescriptionId: (id: string | undefined) => void;
};

export const ItemContext = createContext<Context | null>(null);
export const ItemGroupContext = createContext<{
  size: IdsSize | undefined;
  variant: ItemVariant | undefined;
} | null>(null);

export function useInternalItemContext(part: string) {
  const context = use(ItemContext);
  invariant(context, `\`<${part}>\` must be used inside \`<Item>\`.`);
  return context;
}
