'use client';

import { useCallback, type Ref, type RefCallback } from 'react';

import { mergeRefs } from '../../../../utils';
import { useInternalTabsContext } from '../context';

export function useInternalTabsList(ref: Ref<HTMLDivElement> | undefined) {
  const tabs = useInternalTabsContext('Tabs.List');
  const { listRef } = tabs;
  const mergedRef: RefCallback<HTMLDivElement> = useCallback(
    (node: HTMLDivElement | null) => mergeRefs(listRef, ref)(node),
    [listRef, ref],
  );

  return { tabs, mergedRef };
}
