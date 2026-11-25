'use client';

import { useEffect } from 'react';

import { isDevelopment } from '../../../../utils/dev';

import type { Axis } from '../lib/geometry';

export function useInternalScrollAreaThumbWarning(area: unknown, axis: Axis | null) {
  useEffect(() => {
    if (isDevelopment && (!area || !axis))
      console.warn(
        '[IDS] ScrollArea.Thumb is drawn only inside <ScrollArea.Scrollbar>; it renders nothing here.',
      );
  }, [area, axis]);
}
