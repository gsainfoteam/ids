'use client';

import { createContext, use, useEffect } from 'react';

import { isDevelopment } from '../../../utils/dev';

import type { ScrollArea } from '.';
import type { useInternalScrollArea } from './hooks/use-scroll-area';
import type { Axis, Placement } from './lib/geometry';
import type { IdsSize } from '../../../tokens/types';

type AreaContext = {
  area: ReturnType<typeof useInternalScrollArea>;
  variant: ScrollArea.Variant;
  size: IdsSize;
  scrolls: ScrollArea.Orientation;
  faded: ScrollArea.Orientation | undefined;
  placements: Record<Axis, Placement>;
};

export const ScrollAreaContext = createContext<AreaContext | null>(null);
export const PlacementContext = createContext<Placement>('end');
export const ScrollbarContext = createContext<Axis | null>(null);

export function useInternalAreaContext(part: string) {
  const context = use(ScrollAreaContext);

  useEffect(() => {
    if (isDevelopment && !context)
      console.warn(`[IDS] ${part} is drawn only inside <ScrollArea>; it renders nothing here.`);
  }, [context, part]);

  return context;
}
