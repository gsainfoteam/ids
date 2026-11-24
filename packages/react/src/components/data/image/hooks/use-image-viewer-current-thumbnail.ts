'use client';

import { useEffect, useRef } from 'react';

export function useInternalImageViewerCurrentThumbnail(index: number) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>('[data-current]')
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [index]);

  return listRef;
}
