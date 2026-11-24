'use client';

import { useCallback, useEffect, type Ref, type RefCallback } from 'react';

import { useInternalTabsContentFoundInPage } from './use-tabs-content-found-in-page';
import { mergeRefs } from '../../../../utils';
import { useInternalTabsContext } from '../context';

export function useInternalTabsContent(
  value: string,
  forceMount: boolean,
  ref: Ref<HTMLDivElement> | undefined,
) {
  const tabs = useInternalTabsContext('Tabs.Content');
  const { registerContent } = tabs;
  useEffect(() => registerContent(value, forceMount), [registerContent, value, forceMount]);

  const selected = tabs.value === value;
  const hidden = !selected;
  const mounted = selected || forceMount;
  const panelRef = useInternalTabsContentFoundInPage(mounted, hidden, () => tabs.select(value));
  const mergedRef: RefCallback<HTMLDivElement> = useCallback(
    (node: HTMLDivElement | null) => mergeRefs(panelRef, ref)(node),
    [panelRef, ref],
  );

  return { tabs, selected, hidden, mounted, mergedRef };
}
