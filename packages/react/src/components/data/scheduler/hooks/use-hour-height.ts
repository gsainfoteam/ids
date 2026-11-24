'use client';

import { useState, type RefObject } from 'react';

import { useInternalResizeObserver } from '../../../../hooks/use-resize-observer';
import { HOURS_IN_DAY } from '../lib/layout';

export function useInternalHourHeight(bodyRef: RefObject<HTMLElement | null>, enabled: boolean) {
  const [hourHeight, setHourHeight] = useState<number>();

  useInternalResizeObserver(enabled ? bodyRef : null, (body) => {
    const height = body.offsetHeight / HOURS_IN_DAY;
    setHourHeight(height > 0 ? height : undefined);
  });

  return hourHeight;
}
