'use client';

import { useEffect } from 'react';

import { isDevelopment } from '../../../../utils/dev';

export function useInternalSelectItemsWarning(hidesItems: boolean) {
  useEffect(() => {
    if (isDevelopment && hidesItems)
      console.warn(
        '[IDS] Select found no Select.Item. Items are read from the children of Select, Select.Content and Select.Group, and from Fragments, but not from inside other components.',
      );
  }, [hidesItems]);
}
