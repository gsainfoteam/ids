'use client';

import { useLayoutEffect, useRef } from 'react';

import { isRtl } from '../lib/direction';

export function useInternalDataTableDirection(setRtl: ((rtl: boolean) => void) | undefined) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (rootRef.current) setRtl?.(isRtl(rootRef.current));
  }, [setRtl]);

  return rootRef;
}
