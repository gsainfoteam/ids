'use client';

import { createContext, use, type ReactNode } from 'react';

import { invariant } from '../../../utils';

import type { DataTableFeatures } from './features';
import type { dataTableStyle, DataTableVariant } from './style';
import type { IdsSize } from '../../../tokens/types';
import type { ReactTable } from '@tanstack/react-table';
import type { RowData } from '@tanstack/table-core';

export type DataTableLabelling = {
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
};

type Context = {
  table: ReactTable<DataTableFeatures, RowData>;
  styles: ReturnType<typeof dataTableStyle>;
  variant: DataTableVariant;
  size: IdsSize;
  rtl: boolean;
  busy: boolean;
  caption: ReactNode;
  empty: ReactNode;
  labelling: DataTableLabelling;
};

export const DataTableContext = createContext<Context | null>(null);
export const DataTableToolbarContext = createContext(false);

export function useDataTableContext() {
  const context = use(DataTableContext);
  invariant(context, 'DataTable parts render only inside `<DataTable>`.');
  return context;
}
