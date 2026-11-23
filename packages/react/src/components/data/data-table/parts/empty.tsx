'use client';

import { type ReactNode } from 'react';

import { useInternalTranslate } from '../../../../internal/translate';

export type DataTableEmptyProps = { children?: ReactNode };

export function DataTableEmpty({ children }: DataTableEmptyProps) {
  const t = useInternalTranslate();
  return <>{children ?? t('dataTable.empty')}</>;
}

DataTableEmpty.displayName = 'DataTable.Empty';
