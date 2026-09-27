import { useEffect, useRef, useState, type KeyboardEvent } from 'react';

import { chipToFocusAfter } from './chip-focus';
import { useControllableState } from '../../../hooks/use-controllable-state';
import { isDevelopment } from '../../../utils/dev';

export function useChip({
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
  onRemove: (() => void) | undefined;
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

  const rootRef = useRef<HTMLElement>(null);
  const [labelId, setLabelId] = useState<string>();

  const remove = () => {
    const chip = rootRef.current;
    if (disabled || !onRemove) return;
    const next = chip?.contains(document.activeElement) ? chipToFocusAfter(chip) : null;
    onRemove();
    // Focus moves only once the chip has really left the page; a parent may keep it, for
    // example to ask for confirmation first.
    if (next)
      requestAnimationFrame(() => {
        if (chip && !chip.isConnected && next.isConnected) next.focus();
      });
  };

  // Backspace and Delete remove the focused chip, the way they remove a tag in a tag input.
  const removeOnKey = (event: KeyboardEvent) => {
    if (onRemove === undefined || (event.key !== 'Backspace' && event.key !== 'Delete'))
      return false;
    event.preventDefault();
    remove();
    return true;
  };

  return {
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
