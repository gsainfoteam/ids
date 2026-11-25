'use client';

import { useRef, useState, type KeyboardEvent } from 'react';

import { keyHandler } from '../../../../internal/lib/keys';
import { NEW_TABLE_SIZE, type TableSize } from '../table/insert';
import { cellSelector, within } from '../table/size-grid';

export function useInternalEditorTableSizePicker(onPick: (size: TableSize) => void) {
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState(NEW_TABLE_SIZE);
  const gridRef = useRef<HTMLDivElement>(null);

  const pick = (picked: TableSize) => {
    setOpen(false);
    onPick(picked);
  };

  const moveTo = (next: TableSize) => {
    const bounded = within(next);
    setSize(bounded);
    gridRef.current?.querySelector<HTMLElement>(cellSelector(bounded))?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) =>
    keyHandler<HTMLButtonElement>({
      ArrowRight: () => moveTo({ ...size, cols: size.cols + 1 }),
      ArrowLeft: () => moveTo({ ...size, cols: size.cols - 1 }),
      ArrowDown: () => moveTo({ ...size, rows: size.rows + 1 }),
      ArrowUp: () => moveTo({ ...size, rows: size.rows - 1 }),
    })(event);

  const onOpenChange = (next: boolean) => {
    if (next) setSize(NEW_TABLE_SIZE);
    setOpen(next);
  };

  return { open, onOpenChange, size, setSize, gridRef, pick, onKeyDown };
}
