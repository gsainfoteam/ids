'use client';

import { useEffect } from 'react';

import { isDevelopment } from '../../../../utils/dev';
import { useInternalGroupContext } from '../context';

export function useInternalGroupNameWarning(
  component: string,
  props: { 'aria-label'?: string; 'aria-labelledby'?: string },
) {
  const nested = useInternalGroupContext() !== null;
  const named =
    (typeof props['aria-label'] === 'string' && props['aria-label'].trim() !== '') ||
    props['aria-labelledby'] != null;
  useEffect(() => {
    if (isDevelopment && !named && !nested)
      console.warn(
        `[IDS] ${component}: add aria-label or aria-labelledby so a screen reader can say what the group is for.`,
      );
  }, [component, named, nested]);
}
