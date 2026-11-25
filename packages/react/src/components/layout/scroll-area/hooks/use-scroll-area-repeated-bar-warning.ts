'use client';

import { useEffect } from 'react';

import { isDevelopment } from '../../../../utils/dev';

export function useInternalScrollAreaRepeatedBarWarning(repeated: string) {
  useEffect(() => {
    if (isDevelopment && repeated)
      console.warn(
        `[IDS] ScrollArea has more than one Scrollbar for the same orientation (${repeated}). Only the last one is laid out.`,
      );
  }, [repeated]);
}
