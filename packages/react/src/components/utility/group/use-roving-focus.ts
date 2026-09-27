import { useLayoutEffect, useRef, useState, type KeyboardEvent, type RefObject } from 'react';

import { focusable } from 'tabbable';

import { rovingMove, rovingTabStop, rovingTarget, type RovingItem } from './roving';

import type { GroupOrientation } from '.';

export type RovingElement = RovingItem & { element: HTMLElement };

type Options = {
  rootRef: RefObject<HTMLElement | null>;
  // Selects this group's own items, not those of a group nested inside it.
  itemSelector: string;
  orientation: GroupOrientation;
  loop: boolean;
  // Radio semantics: every arrow key moves, and Tab returns to the checked item.
  radio: boolean;
  checked: string | null;
  // A radio group checks the item that focus lands on.
  onArrive?: (element: HTMLElement) => void;
};

// tabbable knows every way an item stops taking focus: disabled, inside an inert subtree or a
// disabled fieldset, hidden by CSS. Only its container walk prunes inert subtrees, so the group is
// walked once rather than each item checked alone. An aria-disabled item can still take focus, but
// arrow keys pass over it too.
function scan(root: HTMLElement | null, selector: string): RovingElement[] {
  if (!root) return [];
  const reachable = new Set(focusable(root, { displayCheck: 'full-native' }));
  return Array.from(root.querySelectorAll<HTMLElement>(selector), (element) => ({
    element,
    value: element.dataset.value ?? '',
    disabled: !reachable.has(element) || element.getAttribute('aria-disabled') === 'true',
  }));
}

function sameItems(previous: readonly RovingItem[] | null, next: readonly RovingItem[]) {
  return (
    previous !== null &&
    previous.length === next.length &&
    previous.every(
      (item, index) => item.value === next[index]!.value && item.disabled === next[index]!.disabled,
    )
  );
}

// CSS decides the direction, so a dir attribute and a `direction` rule both count. The element's
// own window is asked, which also holds inside an iframe.
function isRtl(element: HTMLElement) {
  const direction = element.ownerDocument.defaultView?.getComputedStyle(element).direction;
  if (direction) return direction === 'rtl';
  return element.closest('[dir]')?.getAttribute('dir') === 'rtl';
}

// One tab stop for the whole group, moved with the arrow keys (WAI-ARIA APG roving tabindex).
export function useRovingFocus({
  rootRef,
  itemSelector,
  orientation,
  loop,
  radio,
  checked,
  onArrive,
}: Options) {
  const [items, setItems] = useState<RovingItem[] | null>(null);
  const [lastFocused, setLastFocused] = useState<string | null>(null);
  const elements = useRef<RovingElement[]>([]);

  // Items are read back from the DOM after every render, so their order is the document order
  // whatever wraps them, and items added, removed or disabled since are picked up. Until then (and
  // on the server) every item stays in the tab order. The state only changes when the items do,
  // so running on every render cannot loop.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    const scanned = scan(rootRef.current, itemSelector);
    elements.current = scanned;
    setItems((previous) =>
      sameItems(previous, scanned)
        ? previous
        : scanned.map(({ value, disabled }) => ({ value, disabled })),
    );
  });

  // A radio group's tab stop is its checked item, a toolbar's the item last focused.
  const tabStop =
    items === null ? undefined : rovingTabStop(items, radio ? [checked] : [lastFocused]);

  const onItemFocus = (value: string) => setLastFocused(value);

  const onItemKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
      return;
    const root = rootRef.current;
    if (!root) return;
    const move = rovingMove(event.key, { orientation, rtl: isRtl(root), anyArrow: radio });
    if (!move) return;
    const scanned = scan(root, itemSelector);
    const from = scanned.findIndex(({ element }) => element === event.currentTarget);
    if (from === -1) return;
    // Arrow keys belong to the group even at an end it does not loop past; the page must not scroll.
    event.preventDefault();
    const to = rovingTarget(scanned, from, move, loop);
    if (to === -1 || to === from) return;
    const target = scanned[to]!.element;
    target.focus();
    onArrive?.(target);
  };

  return { items, elements, tabStop, onItemFocus, onItemKeyDown };
}
