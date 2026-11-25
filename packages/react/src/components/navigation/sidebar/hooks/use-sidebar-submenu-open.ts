'use client';

import { useState, type ReactElement } from 'react';

import { containsValue } from '../lib/item-children';

import type { SidebarSortableValue } from '../context';

type SubmenuOpenOptions = {
  treeKey: string | undefined;
  subItems: ReactElement[];
  value: string | undefined;
  revealed: SidebarSortableValue['revealed'];
};

export function useInternalSidebarSubmenuOpen({
  treeKey,
  subItems,
  value,
  revealed,
}: SubmenuOpenOptions) {
  const [open, setOpen] = useState(() => containsValue(subItems, value));
  const [seenReveal, setSeenReveal] = useState(revealed?.times);

  if (revealed && revealed.times !== seenReveal) {
    setSeenReveal(revealed.times);
    if (treeKey !== undefined && revealed.ancestors.includes(treeKey)) setOpen(true);
  }

  return [open, setOpen] as const;
}
