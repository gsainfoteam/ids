'use client';

import { useEffect, type ReactNode } from 'react';

import { isDevelopment } from '../../utils/dev';
import { hasName, iconLabel, warnFunctionNameLabel, type NameProps } from '../lib/icon-label';

export function useInternalIconLabel(
  component: string,
  icon: ReactNode | undefined,
  ...names: Array<NameProps | undefined>
) {
  const notIconOnlyRightNow = icon === undefined;
  const needsNoLabel = notIconOnlyRightNow || names.some(hasName);
  const derived = needsNoLabel ? undefined : iconLabel(icon);
  const label = derived?.label;
  const fromFunction = derived?.source === 'function';

  useEffect(() => {
    if (!isDevelopment || needsNoLabel) return;
    if (label === undefined)
      console.warn(
        `[IDS] ${component}: no accessible name could be found for this icon. Pass aria-label, or give the icon component a displayName.`,
      );
    else if (fromFunction) warnFunctionNameLabel(component, label);
  }, [component, needsNoLabel, label, fromFunction]);

  return label;
}
