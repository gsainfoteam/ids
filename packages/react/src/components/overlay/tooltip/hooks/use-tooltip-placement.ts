'use client';

import { useLayoutEffect } from 'react';

import type { TooltipPlacement } from './use-tooltip';

export function useInternalTooltipPlacement(
  setPlacement: (placement: TooltipPlacement) => void,
  { side, align, sideOffset }: TooltipPlacement,
) {
  useLayoutEffect(() => {
    setPlacement({ side, align, sideOffset });
  }, [setPlacement, side, align, sideOffset]);
}
