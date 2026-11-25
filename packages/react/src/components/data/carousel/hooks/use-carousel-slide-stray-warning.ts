'use client';

import { useEffect } from 'react';

import { isDevelopment } from '../../../../utils/dev';

export function useInternalCarouselSlideStrayWarning(stray: boolean) {
  useEffect(() => {
    if (isDevelopment && stray)
      console.warn(
        '[IDS] Carousel.Slide must be a child of Carousel.Content. A slide outside it is not part of the track and cannot be reached by dragging, buttons or keys.',
      );
  }, [stray]);
}
