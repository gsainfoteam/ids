'use client';

import { createContext, use, useEffect } from 'react';

import { isDevelopment } from '../../../utils/dev';

import type { ScrollArea } from '.';
import type { Axis, Placement } from './geometry';
import type { useScrollArea } from './use-scroll-area';
import type { IdsSize } from '../../../tokens/types';

type AreaContext = {
  area: ReturnType<typeof useScrollArea>;
  variant: ScrollArea.Variant;
  size: IdsSize;
  scrolls: ScrollArea.Orientation;
  placements: Record<Axis, Placement>;
};

export const ScrollAreaContext = createContext<AreaContext | null>(null);
export const PlacementContext = createContext<Placement>('end');
export const ScrollbarContext = createContext<Axis | null>(null);

export function useAreaContext(part: string) {
  const context = use(ScrollAreaContext);

  useEffect(() => {
    if (isDevelopment && !context)
      console.warn(`[IDS] ${part} is drawn only inside <ScrollArea>; it renders nothing here.`);
  }, [context, part]);

  return context;
}
