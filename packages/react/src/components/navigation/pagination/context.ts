'use client';

import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { paginationStyle } from './style';
import type { IdsSize, IdsVariant } from '../../../tokens/types';

export type PaginationContextValue = {
  page: number;
  pageCount: number;
  siblingCount: number;
  boundaryCount: number;
  size: IdsSize;
  variant: IdsVariant;
  disabled: boolean;
  getHref: ((page: number) => string) | undefined;
  setPage: (page: number) => void;
  styles: ReturnType<typeof paginationStyle>;
};

export const PaginationContext = createContext<PaginationContextValue | null>(null);

export function usePaginationContext(part: string) {
  const context = use(PaginationContext);
  invariant(context, `\`<${part}>\` must be used inside \`<Pagination>\`.`);
  return context;
}
