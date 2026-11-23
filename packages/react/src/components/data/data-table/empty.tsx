'use client';

import { type ReactNode } from 'react';

export type DataTableEmptyProps = { children?: ReactNode };

export function DataTableEmpty({ children }: DataTableEmptyProps) {
  return <>{children}</>;
}

DataTableEmpty.displayName = 'DataTable.Empty';
