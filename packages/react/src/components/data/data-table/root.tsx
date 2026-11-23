'use client';

import { isValidElement, useLayoutEffect, useRef, type ReactNode } from 'react';

import { isEqual, isPlainObject } from 'es-toolkit';

import { DataTableCaption } from './caption';
import { DataTableContent } from './content';
import { DataTableContext } from './context';
import { DataTableEmpty } from './empty';
import { DataTablePagination } from './pagination';
import { dataTableStyle } from './style';
import { DataTableToolbar } from './toolbar';
import { useControllableState } from '../../../hooks/use-controllable-state';
import { elementTypeOf, flattenFragments } from '../../../utils';

import type { DataTable } from '.';
import type { DataTableFeatures } from './features';
import type { ReactTable } from '@tanstack/react-table';
import type { RowData, RowSelectionState, Updater } from '@tanstack/table-core';

const NO_SELECTION: RowSelectionState = {};

function selectionOf(value: unknown) {
  if (value === undefined) return undefined;
  return isPlainObject(value) ? (value as RowSelectionState) : NO_SELECTION;
}

function applied(updater: Updater<RowSelectionState>, previous: RowSelectionState) {
  return typeof updater === 'function' ? updater(previous) : updater;
}

function useSelectionTrio(
  table: ReactTable<DataTableFeatures, RowData>,
  trio: Pick<DataTable.Props<RowData>, 'value' | 'defaultValue' | 'onValueChange'>,
) {
  const meta = table.options.meta;
  const [selection, setSelection] = useControllableState({
    value: selectionOf(trio.value),
    defaultValue: trio.defaultValue ?? NO_SELECTION,
    onValueChange: trio.onValueChange,
  });
  const shown = table.state.rowSelection;

  useLayoutEffect(() =>
    meta?.ownSelection((updater) => setSelection((previous) => applied(updater, previous))),
  );

  useLayoutEffect(() => {
    if (meta && !isEqual(selection, shown)) meta.showSelection(selection);
  }, [meta, selection, shown]);
}

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
  value,
  defaultValue,
  onValueChange,
  className,
  style,
  children,
}: DataTable.Props<TData>) {
  const table = instance as unknown as ReactTable<DataTableFeatures, RowData>;
  const rootRef = useRef<HTMLDivElement>(null);
  const setRtl = table.options.meta?.setRtl;
  useSelectionTrio(table, { value, defaultValue, onValueChange });

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
