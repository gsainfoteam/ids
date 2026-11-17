'use client';

import { useCallback } from 'react';

const ROW_HEIGHT = '--item-row-height';

export function useMediaSize(framed: boolean) {
  return useCallback(
    (media: HTMLElement | null) => {
      const row = media?.closest<HTMLElement>('[data-item]');
      if (!framed || !media || !row) return;

      const apply = () => media.style.setProperty(ROW_HEIGHT, getComputedStyle(row).height);
      let frame = 0;
      const observer = new ResizeObserver(() => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(apply);
      });

      apply();
      observer.observe(row);

      return () => {
        observer.disconnect();
        cancelAnimationFrame(frame);
        media.style.removeProperty(ROW_HEIGHT);
      };
    },
    [framed],
  );
}
