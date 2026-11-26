'use client';

import { use, useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';

import { useControllableState } from '../../../../hooks/use-controllable-state';
import { keyHandler, withModifiers } from '../../../../internal/lib/keys';
import { isDevelopment } from '../../../../utils/dev';
import { ChipGroupContext } from '../context';
import { chipToFocusAfter } from '../lib/chip-focus';

export type ChipRemoveEvent = MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>;

export function useInternalChip({
  selected,
  defaultSelected,
  onSelectedChange,
  onRemove,
  hasClick,
  disabled,
}: {
  selected: boolean | undefined;
  defaultSelected: boolean | undefined;
  onSelectedChange: ((selected: boolean) => void) | undefined;
  onRemove: ((event: ChipRemoveEvent) => void) | undefined;
  hasClick: boolean;
  disabled: boolean;
}) {
  const selectable =
    selected !== undefined || defaultSelected !== undefined || onSelectedChange !== undefined;
  const [isSelected, setSelected] = useControllableState({
    value: selected,
    defaultValue: defaultSelected ?? false,
    onValueChange: onSelectedChange,
  });
  useEffect(() => {
    if (isDevelopment && selected !== undefined && onSelectedChange === undefined)
      console.warn('[IDS] Chip: selected needs onSelectedChange, or use defaultSelected.');
  }, [selected, onSelectedChange]);

  const group = use(ChipGroupContext);
  const rootRef = useRef<HTMLElement>(null);
  const [labelId, setLabelId] = useState<string>();

  const remove = (event: ChipRemoveEvent) => {
    const chip = rootRef.current;
    const groupRoot = group?.root.current;
    if (disabled || !onRemove) return;
    const next =
      chip && groupRoot && chip.contains(document.activeElement)
        ? chipToFocusAfter(groupRoot, chip)
        : null;
    onRemove(event);
    const parentMovesFocus = event.defaultPrevented;
    if (next && !parentMovesFocus)
      requestAnimationFrame(() => {
        if (chip && !chip.isConnected && next.isConnected) next.focus();
      });
  };

  const removeOnKey = (event: KeyboardEvent<HTMLElement>) => {
    if (onRemove === undefined) return false;

    return keyHandler(withModifiers({ Backspace: remove, Delete: remove }))(event);
  };

  return {
    groupSize: group?.size,
    rootRef,
    selectable,
    selected: isSelected,
    interactive: selectable || hasClick,
    removable: onRemove !== undefined,
    toggle: () => setSelected(!isSelected),
    remove,
    removeOnKey,
    labelId,
    setLabelId,
  };
}
