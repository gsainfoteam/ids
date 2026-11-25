'use client';

import { isValidElement, type ReactNode } from 'react';

import { DataTableContext } from './context';
import { useInternalDataTableDirection } from './hooks/use-data-table-direction';
import { useInternalDataTableSelection } from './hooks/use-data-table-selection';
import { DataTableCaption } from './parts/caption';
import { DataTableContent } from './parts/content';
import { DataTableEmpty } from './parts/empty';
import { DataTablePagination } from './parts/pagination';
import { DataTableToolbar } from './parts/toolbar';
import { dataTableStyle } from './style';
import { elementTypeOf, flattenFragments } from '../../../utils';

import type { DataTable } from '.';
import type { DataTableFeatures } from './lib/features';
import type { ReactTable } from '@tanstack/react-table';
import type { RowData } from '@tanstack/table-core';

function isPart(child: ReactNode, part: unknown) {
  return isValidElement(child) && elementTypeOf(child) === part;
}

function DefaultLayout({ selectable, paginated }: { selectable: boolean; paginated: boolean }) {
  return (
    <>
      <DataTableContent />
      {(selectable || paginated) && (
        <DataTableToolbar>{paginated && <DataTablePagination />}</DataTableToolbar>
      )}
    </>
  );
}

export function DataTableRoot<TData extends RowData>({
  table: instance,
  variant = 'outline',
  size = 'standard',
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  'aria-busy': ariaBusy,
  value,
  defaultValue,
  onValueChange,
  className,
  style,
  children,
}: DataTable.Props<TData>) {
  const table = instance as unknown as ReactTable<DataTableFeatures, RowData>;
  const selection = useInternalDataTableSelection(table, { value, defaultValue, onValueChange });
  const rootRef = useInternalDataTableDirection(table.options.meta?.setRtl);

  const parts = flattenFragments(children);
  const caption = parts.find((child) => isPart(child, DataTableCaption));
  const empty = parts.find((child) => isPart(child, DataTableEmpty));
  const layout = parts.filter(
    (child) => !isPart(child, DataTableCaption) && !isPart(child, DataTableEmpty),
  );

  const busy = ariaBusy === true || ariaBusy === 'true';
  const styles = dataTableStyle({ variant, size, busy });
  const meta = table.options.meta;

  return (
    <DataTableContext
      value={{
        table,
        styles,
        variant,
        size,
        rtl: table.options.columnResizeDirection === 'rtl',
        busy,
        selection,
        caption,
        empty,
        labelling: {
          id,
          'aria-label': ariaLabel,
          'aria-labelledby': ariaLabelledBy,
          'aria-describedby': ariaDescribedBy,
        },
      }}
    >
      <div
        ref={rootRef}
        data-data-table=""
        data-variant={variant}
        data-loading={busy ? '' : undefined}
        className={styles.root({ className })}
        style={style}
      >
        {layout.length > 0 ? (
          layout
        ) : (
          <DefaultLayout
            selectable={meta?.selectable ?? false}
            paginated={meta?.paginated ?? false}
          />
        )}
      </div>
    </DataTableContext>
  );
}
