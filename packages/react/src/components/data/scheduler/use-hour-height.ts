'use client';

import { useLayoutEffect, useState, type RefObject } from 'react';

import { HOURS_IN_DAY } from './layout';

export function useHourHeight(bodyRef: RefObject<HTMLElement | null>, enabled: boolean) {
  const [hourHeight, setHourHeight] = useState<number>();

  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (!enabled || !body) return;

    const read = () => {
      const height = body.offsetHeight / HOURS_IN_DAY;
      setHourHeight(height > 0 ? height : undefined);
    };
    read();

    const observer = new ResizeObserver(read);
    observer.observe(body);
    return () => observer.disconnect();
  }, [bodyRef, enabled]);

  return hourHeight;
}
