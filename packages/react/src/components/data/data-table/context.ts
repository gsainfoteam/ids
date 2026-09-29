'use client';

import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { dataTableStyle } from './style';
import type { IdsSize } from '../../../tokens/types';

type Context = {
  styles: ReturnType<typeof dataTableStyle>;
  size: IdsSize;
  rtl: boolean;
  getRowLabel: ((row: never) => string) | undefined;
};

export const DataTableContext = createContext<Context | null>(null);

export function useDataTableContext() {
  const context = use(DataTableContext);
  invariant(context, 'DataTable parts render only inside `<DataTable>`.');
  return context;
}
