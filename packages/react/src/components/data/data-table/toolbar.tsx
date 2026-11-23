'use client';

import { type ComponentProps } from 'react';

import { DataTableToolbarContext, useDataTableContext } from './context';
import { useTranslate } from '../../../internal/translate';

export type DataTableToolbarProps = ComponentProps<'div'>;

export function DataTableToolbar({ className, children, ...props }: DataTableToolbarProps) {
  const t = useTranslate();
  const { table, styles, selection } = useDataTableContext();

  const selectable = table.options.meta?.selectable ?? false;
  const selected = Object.values(selection).filter(Boolean).length;

  return (
    <DataTableToolbarContext value>
      <div {...props} data-data-table-toolbar="" className={styles.bar({ className })}>
        {selectable && (
          <p aria-live="polite" data-data-table-summary="" className={styles.summary()}>
            {t('dataTable.selected', { count: selected })}
          </p>
        )}
        {children !== undefined && (
          <div data-data-table-actions="" className={styles.actions()}>
            {children}
          </div>
        )}
      </div>
    </DataTableToolbarContext>
  );
}

DataTableToolbar.displayName = 'DataTable.Toolbar';
