'use client';

import { useLayoutEffect } from 'react';

export function useInternalMenuLabelPresence(
  setLabelled: ((labelled: boolean) => void) | undefined,
) {
  useLayoutEffect(() => {
    if (!setLabelled) return;

    setLabelled(true);
    return () => setLabelled(false);
  }, [setLabelled]);
}
