'use client';

import { type ReactNode } from 'react';

import { useTranslate } from '../../../internal/translate';

export type DataTableEmptyProps = { children?: ReactNode };

export function DataTableEmpty({ children }: DataTableEmptyProps) {
  const t = useTranslate();
  return <>{children ?? t('dataTable.empty')}</>;
}

DataTableEmpty.displayName = 'DataTable.Empty';
