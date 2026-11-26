'use client';

import { useInternalMediaQuery } from '../../../hooks/use-media-query';
import { SMALL_SCREEN, type PopupPresentation } from '../lib/sheet-viewport';

export function useInternalDrawerPresentation(narrow: PopupPresentation | undefined) {
  return useInternalMediaQuery(narrow === 'drawer' ? SMALL_SCREEN : null);
}
