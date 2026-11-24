'use client';

import { useCallback } from 'react';

import type { useInternalScrollArea } from './use-scroll-area';
import type { Placement } from '../lib/geometry';

type CornerRegister = {
  occupied: boolean;
  registerCorner: ReturnType<typeof useInternalScrollArea>['registerCorner'] | undefined;
  vertical: Placement | undefined;
  horizontal: Placement | undefined;
};

export function useInternalScrollAreaCornerRegister({
  occupied,
  registerCorner,
  vertical,
  horizontal,
}: CornerRegister) {
  return useCallback(
    (node: HTMLDivElement | null) =>
      node && occupied && registerCorner && vertical && horizontal
        ? registerCorner(node, { x: horizontal, y: vertical })
        : undefined,
    [occupied, registerCorner, vertical, horizontal],
  );
}
