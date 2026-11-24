'use client';

import { useEffect, useState, type RefObject } from 'react';

import { ITEM_SELECTOR, type PendingMove } from '../lib/sortable-drop';

import type { SidebarFrame, SidebarSortableValue } from '../context';
import type { SidebarTree } from '../lib/tree';

type MovedItemRevealOptions<T> = {
  items: readonly T[];
  tree: SidebarTree<T>;
  pendingRef: RefObject<PendingMove | null>;
  framesRef: RefObject<Map<string, SidebarFrame>>;
};

export function useInternalSidebarMovedItemReveal<T>({
  items,
  tree,
  pendingRef,
  framesRef,
}: MovedItemRevealOptions<T>) {
  const [revealed, setRevealed] = useState<SidebarSortableValue['revealed']>(null);

  useEffect(() => {
    const move = pendingRef.current;
    if (!move || move.items === items) return;
    pendingRef.current = null;

    const ancestors: string[] = [];
    for (let node = tree.nodes.get(move.key); node?.parent; node = tree.nodes.get(node.parent))
      ancestors.push(node.parent);
    setRevealed((previous) => ({ ancestors, times: (previous?.times ?? 0) + 1 }));

    if (!move.focus) return;
    const focusTheMovedItem = () =>
      framesRef.current.get(move.key)?.element.querySelector<HTMLElement>(ITEM_SELECTOR)?.focus();
    focusTheMovedItem();
    const frame = requestAnimationFrame(focusTheMovedItem);
    return () => cancelAnimationFrame(frame);
  }, [items, tree, pendingRef, framesRef]);

  return revealed;
}
