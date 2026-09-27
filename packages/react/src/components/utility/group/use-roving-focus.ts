import { useLayoutEffect, useRef, useState, type KeyboardEvent, type RefObject } from 'react';

import { focusable } from 'tabbable';

import { rovingMove, rovingTabStop, rovingTarget, type RovingItem } from './roving';

import type { GroupOrientation } from '.';

export type RovingElement = RovingItem & { element: HTMLElement };

type Options = {
  rootRef: RefObject<HTMLElement | null>;
  itemSelector: string;
  orientation: GroupOrientation;
  loop: boolean;
  radio: boolean;
  checked: string | null;
  onArrive?: (element: HTMLElement) => void;
};

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

function isRtl(element: HTMLElement) {
  const direction = element.ownerDocument.defaultView?.getComputedStyle(element).direction;
  if (direction) return direction === 'rtl';
  return element.closest('[dir]')?.getAttribute('dir') === 'rtl';
}

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
    event.preventDefault();
    const to = rovingTarget(scanned, from, move, loop);
    if (to === -1 || to === from) return;
    const target = scanned[to]!.element;
    target.focus();
    onArrive?.(target);
  };

  return { items, elements, tabStop, onItemFocus, onItemKeyDown };
}
