'use client';

import { useInternalMediaQuery } from '../../../hooks/use-media-query';
import { SMALL_SCREEN, type PopupPresentation } from '../lib/sheet-viewport';

export function useInternalDrawerPresentation(mobileVariant: PopupPresentation | undefined) {
  return useInternalMediaQuery(mobileVariant === 'drawer' ? SMALL_SCREEN : null);
}
