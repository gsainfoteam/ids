'use client';

import { useEffect } from 'react';

import { isDevelopment } from '../../../../utils/dev';

export function useInternalAvatarNameWarning(decorative: boolean, label: string | undefined) {
  useEffect(() => {
    if (isDevelopment && !decorative && label === undefined)
      console.warn(
        '[IDS] Avatar: pass name, alt or aria-label so it has an accessible name, or alt="" when it is decorative.',
      );
  }, [decorative, label]);
}
