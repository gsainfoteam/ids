'use client';

import { isValidElement, useLayoutEffect, useRef, type ReactNode } from 'react';

import { DataTableCaption } from './caption';
import { DataTableContent } from './content';
import { DataTableContext } from './context';
import { DataTableEmpty } from './empty';
import { DataTablePagination } from './pagination';
import { dataTableStyle } from './style';
import { DataTableToolbar } from './toolbar';
import { elementTypeOf, flattenFragments } from '../../../utils';

import type { DataTable } from '.';
import type { DataTableFeatures } from './features';
import type { ReactTable } from '@tanstack/react-table';
import type { RowData } from '@tanstack/table-core';

function isRtl(element: HTMLElement) {
  const direction = element.ownerDocument.defaultView?.getComputedStyle(element).direction;
  if (direction) return direction === 'rtl';
  return element.closest('[dir]')?.getAttribute('dir') === 'rtl';
}

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
  className,
  style,
  children,
}: DataTable.Props<TData>) {
  const table = instance as unknown as ReactTable<DataTableFeatures, RowData>;
  const rootRef = useRef<HTMLDivElement>(null);
  const setRtl = table.options.meta?.setRtl;

  useLayoutEffect(() => {
    if (rootRef.current) setRtl?.(isRtl(rootRef.current));
  }, [setRtl]);

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
