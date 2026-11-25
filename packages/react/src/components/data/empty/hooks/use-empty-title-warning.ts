'use client';

import { useEffect } from 'react';

import { isDevelopment } from '../../../../utils/dev';

export function useInternalEmptyTitleWarning(hasTitle: boolean) {
  useEffect(() => {
    if (isDevelopment && !hasTitle) console.warn('[IDS] Empty: give it an Empty.Title.');
  }, [hasTitle]);
}
