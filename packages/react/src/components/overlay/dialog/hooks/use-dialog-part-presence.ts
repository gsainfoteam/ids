'use client';

import { useLayoutEffect } from 'react';

export function useInternalDialogPartPresence(setPresent: (present: boolean) => void) {
  useLayoutEffect(() => {
    setPresent(true);
    return () => setPresent(false);
  }, [setPresent]);
}
