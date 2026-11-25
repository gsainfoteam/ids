'use client';

import { useEffect } from 'react';

import { isDevelopment } from '../../../../utils/dev';

export function useInternalCarouselNameWarning(named: boolean) {
  useEffect(() => {
    if (isDevelopment && !named)
      console.warn(
        '[IDS] Carousel: give the carousel a name with aria-label (or aria-labelledby). Screen readers announce it with the carousel role.',
      );
  }, [named]);
}
