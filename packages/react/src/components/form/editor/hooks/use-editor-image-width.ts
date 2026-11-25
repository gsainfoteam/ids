'use client';

import { useEffect, useState } from 'react';

export function useInternalEditorImageWidth(element: HTMLElement | null) {
  const [width, setWidth] = useState<number>();

  useEffect(() => {
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry?.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);

  return width;
}
