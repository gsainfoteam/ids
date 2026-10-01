'use client';

import { createContext, use, type ReactNode } from 'react';

import { invariant } from '../../../utils';

import type { breadcrumbStyle } from './style';

type BreadcrumbContextValue = {
  styles: ReturnType<typeof breadcrumbStyle>;
  separator: ReactNode;
  maxItems: number | undefined;
};

export const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null);

export const CollapsedContext = createContext(false);

export function useBreadcrumbContext(part: string) {
  const context = use(BreadcrumbContext);
  invariant(context, `\`<${part}>\` must be used inside \`<Breadcrumb>\`.`);
  return context;
}
