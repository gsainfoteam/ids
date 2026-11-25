'use client';

import { useCallback, useRef } from 'react';

export function useInternalMessageContentReader() {
  const contentRef = useRef<HTMLDivElement>(null);
  const readContent = useCallback(() => contentRef.current?.innerText ?? '', []);

  return { contentRef, readContent };
}
