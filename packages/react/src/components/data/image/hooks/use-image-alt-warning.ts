'use client';

import { useEffect } from 'react';

import { isDevelopment } from '../../../../utils/dev';

export function useInternalImageAltWarning(alt: string | undefined, previewable: boolean) {
  useEffect(() => {
    if (!isDevelopment) return;
    if (alt === undefined)
      console.warn(
        '[IDS] Image: pass alt. Say what the picture shows, or pass alt="" when it only decorates the page.',
      );
    else if (previewable && alt.trim() === '')
      console.warn(
        '[IDS] Image: an image that opens the viewer needs an alt that says what it shows.',
      );
  }, [alt, previewable]);
}
