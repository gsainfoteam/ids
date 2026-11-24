'use client';

import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { breadcrumbStyle } from './style';

type BreadcrumbContextValue = {
  styles: ReturnType<typeof breadcrumbStyle>;
  maxItems: number | undefined;
};

export const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null);

export const CollapsedContext = createContext(false);

export function useInternalBreadcrumbContext(part: string) {
  const context = use(BreadcrumbContext);
  invariant(context, `\`<${part}>\` must be used inside \`<Breadcrumb>\`.`);
  return context;
}
