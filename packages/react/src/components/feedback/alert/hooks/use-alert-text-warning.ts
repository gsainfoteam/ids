'use client';

import { useEffect } from 'react';

import { isDevelopment } from '../../../../utils/dev';

export function useInternalAlertTextWarning(hasText: boolean) {
  useEffect(() => {
    if (isDevelopment && !hasText)
      console.warn('[IDS] Alert: give it an AlertTitle or an AlertDescription.');
  }, [hasText]);
}
