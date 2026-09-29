'use client';

import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { tableStyle } from './style';

export type TableVariant = 'outline' | 'ghost';
export type TableSection = 'header' | 'body' | 'footer';
export type TableAlign = 'start' | 'center' | 'end';
export type TableLayout = 'auto' | 'fixed';

type Context = {
  styles: ReturnType<typeof tableStyle>;
  highlightOnHover: boolean;
};

export const TableContext = createContext<Context | null>(null);
export const TableSectionContext = createContext<TableSection>('body');

export function useTableContext(part: string) {
  const context = use(TableContext);
  invariant(context, `\`<${part}>\` must be used inside \`<Table>\`.`);
  return context;
}
