'use client';

import { useLayoutEffect } from 'react';

import { isEqual } from 'es-toolkit';

import { useControllableState } from '../../../../hooks/use-controllable-state';
import { applied, NO_SELECTION, selectionOf } from '../lib/row-selection';

import type { DataTable } from '..';
import type { DataTableFeatures } from '../lib/features';
import type { ReactTable } from '@tanstack/react-table';
import type { RowData } from '@tanstack/table-core';

export function useInternalDataTableSelection(
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

  return selection;
}
