'use client';

import { useMemo } from 'react';

import { buildTree, type SidebarTreeItem } from '../lib/tree';

export function useInternalSidebarTree<T extends SidebarTreeItem<T>>(items: readonly T[]) {
  return useMemo(() => buildTree(items), [items]);
}
