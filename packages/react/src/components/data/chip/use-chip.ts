import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';

import { chipToFocusAfter } from './chip-focus';
import { useControllableState } from '../../../hooks/use-controllable-state';
import { isDevelopment } from '../../../utils/dev';

// The click or key press that asked for the chip to go.
export type ChipRemoveEvent = MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>;

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

  const rootRef = useRef<HTMLElement>(null);
  const [labelId, setLabelId] = useState<string>();

  const remove = (event: ChipRemoveEvent) => {
    const chip = rootRef.current;
    if (disabled || !onRemove) return;
    const next = chip?.contains(document.activeElement) ? chipToFocusAfter(chip) : null;
    onRemove(event);
    // Focus moves only once the chip has really left the page; a parent may keep it, for
    // example to ask for confirmation first. A parent that prevents the default sends focus
    // somewhere of its own, such as the input of a tag field.
    if (next && !event.defaultPrevented)
      requestAnimationFrame(() => {
        if (chip && !chip.isConnected && next.isConnected) next.focus();
      });
  };

  // Backspace and Delete remove the focused chip, the way they remove a tag in a tag input. The
  // key's own default is prevented only after onRemove has had its say about focus.
  const removeOnKey = (event: KeyboardEvent<HTMLElement>) => {
    if (onRemove === undefined || (event.key !== 'Backspace' && event.key !== 'Delete'))
      return false;
    remove(event);
    event.preventDefault();
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
