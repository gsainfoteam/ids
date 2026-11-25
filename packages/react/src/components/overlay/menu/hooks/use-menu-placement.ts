'use client';

import { useLayoutEffect } from 'react';

import type { MenuLevel, MenuPlacement } from './use-menu';

export function useInternalMenuPlacement(
  level: MenuLevel,
  { side, align, sideOffset, alignOffset }: MenuPlacement,
) {
  const { setPlacement } = level;

  useLayoutEffect(() => {
    setPlacement({ side, align, sideOffset, alignOffset });
  }, [setPlacement, side, align, sideOffset, alignOffset]);
}
