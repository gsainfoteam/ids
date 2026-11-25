'use client';

import { useEffect, type RefObject } from 'react';

import { isDevelopment } from '../../../../utils/dev';

import type { ThemeContextValue } from './use-ids-provider';
import type { IdsThemeIssue } from '../lib/theme-roles';

export function useInternalIdsProviderWarnings(
  context: ThemeContextValue,
  issues: IdsThemeIssue[],
  elementRef: RefObject<HTMLElement | null>,
) {
  const hasPrimary = context.theme.primary !== undefined;

  useEffect(() => {
    if (!isDevelopment) return;
    if (!hasPrimary)
      console.error(
        "[IDS] IdsProvider: the outermost IdsProvider needs a theme with a primary color, such as <IdsProvider theme={defineIdsTheme({ primary: '#0d9488' })}>. IdsProvider.Scope only changes the theme it inherits.",
      );
    for (const issue of issues)
      console.warn(`[IDS] IdsProvider theme.${issue.path}: ${issue.message}`);
  }, [hasPrimary, issues]);

  useEffect(() => {
    if (!isDevelopment || !hasPrimary || !elementRef.current) return;
    const surface = getComputedStyle(elementRef.current).getPropertyValue('--ids-color-bg-base');
    if (surface.trim() === '')
      console.warn(
        '[IDS] IdsProvider: no IDS color tokens on this element. Import @gsainfoteam/ids-css after tailwindcss.',
      );
  }, [hasPrimary, context.resolvedMode, elementRef]);
}
