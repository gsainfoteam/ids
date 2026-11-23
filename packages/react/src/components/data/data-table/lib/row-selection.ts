import { isPlainObject } from 'es-toolkit';

import type { RowSelectionState, Updater } from '@tanstack/table-core';

export const NO_SELECTION: RowSelectionState = {};

export function selectionOf(value: unknown) {
  if (value === undefined) return undefined;
  return isPlainObject(value) ? (value as RowSelectionState) : NO_SELECTION;
}

export function applied(updater: Updater<RowSelectionState>, previous: RowSelectionState) {
  return typeof updater === 'function' ? updater(previous) : updater;
}
