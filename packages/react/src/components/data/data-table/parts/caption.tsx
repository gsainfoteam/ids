'use client';

import { TableCaption, type TableCaptionProps } from '../../table/parts/caption';

export type DataTableCaptionProps = TableCaptionProps;

export function DataTableCaption(props: DataTableCaptionProps) {
  return <TableCaption {...props} />;
}

DataTableCaption.displayName = 'DataTable.Caption';
