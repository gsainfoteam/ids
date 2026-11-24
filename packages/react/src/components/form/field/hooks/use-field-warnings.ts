'use client';

import { useEffect } from 'react';

import { isDevelopment } from '../../../../utils/dev';

export function useInternalFieldWarnings({
  controls,
  accessibleName,
  duplicated,
}: {
  controls: number;
  accessibleName: boolean;
  duplicated: string;
}) {
  useEffect(() => {
    if (!isDevelopment) return;
    if (controls !== 1) console.warn('[IDS] Field: exactly one direct child control is required.');
    if (!accessibleName) console.warn('[IDS] Field: Field.Label or aria-label is required.');
    if (duplicated) console.warn(`[IDS] Field: only one ${duplicated} part is supported.`);
  }, [controls, accessibleName, duplicated]);
}
