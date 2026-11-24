'use client';

import { useEffect } from 'react';

import { isDevelopment } from '../../utils/dev';

export type AccessibleName =
  | { 'aria-label': string; 'aria-labelledby'?: never }
  | { 'aria-labelledby': string; 'aria-label'?: never };

type NameProps = { 'aria-label'?: unknown; 'aria-labelledby'?: unknown };

const componentsWarnedAbout = new Set<string>();

const isText = (value: unknown) => typeof value === 'string' && value.trim() !== '';

export function hasAccessibleName(props: NameProps) {
  return isText(props['aria-label']) || isText(props['aria-labelledby']);
}

export function useInternalUnnamedWarning(component: string, unnamed: boolean) {
  useEffect(() => {
    if (!isDevelopment || !unnamed || componentsWarnedAbout.has(component)) return;
    componentsWarnedAbout.add(component);
    console.warn(
      `[IDS] ${component}: it has no accessible name. Pass aria-label, or aria-labelledby with the id of a visible heading.`,
    );
  }, [component, unnamed]);
}

export function useInternalRequiredName(component: string, props: NameProps) {
  useInternalUnnamedWarning(component, !hasAccessibleName(props));
}
