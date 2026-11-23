'use client';

import { useEffect } from 'react';

import { isDevelopment } from '../../../../utils/dev';

export function useInternalBreadcrumbListEmptyWarning(empty: boolean) {
  useEffect(() => {
    if (isDevelopment && empty)
      console.warn('[IDS] Breadcrumb: add at least one Breadcrumb.Item to the trail.');
  }, [empty]);
}
