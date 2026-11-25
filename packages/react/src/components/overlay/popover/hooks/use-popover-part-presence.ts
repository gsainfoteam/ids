'use client';

import { useLayoutEffect } from 'react';

export function useInternalPopoverPartPresence(setPresent: (present: boolean) => void) {
  useLayoutEffect(() => {
    setPresent(true);
    return () => setPresent(false);
  }, [setPresent]);
}
