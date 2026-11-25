'use client';

import { useEffect } from 'react';

import { isDevelopment } from '../../../../utils/dev';

export function useInternalChipFieldItemsWarning(hidesItems: boolean) {
  useEffect(() => {
    if (isDevelopment && hidesItems)
      console.warn(
        '[IDS] ChipField found no ChipField.Item. Items are read from the children of ChipField, ChipField.Content and ChipField.Group, and from Fragments, but not from inside other components.',
      );
  }, [hidesItems]);
}
