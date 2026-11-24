'use client';

import { useCallback, type ComponentProps } from 'react';

import { mergeRefs } from '../../../../utils';
import { useInternalTabsContext } from '../context';

export type TabsListProps = Omit<ComponentProps<'div'>, 'role' | 'aria-orientation'>;

export function TabsList({ className, ref, children, ...rest }: TabsListProps) {
  const tabs = useInternalTabsContext('Tabs.List');
  const { listRef } = tabs;
  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => mergeRefs(listRef, ref)(node),
    [listRef, ref],
  );

  return (
    <div
      {...rest}
      ref={mergedRef}
      role="tablist"
      aria-orientation={tabs.orientation}
      data-orientation={tabs.orientation}
      className={tabs.styles.list({ className })}
    >
      {children}
    </div>
  );
}

TabsList.displayName = 'Tabs.List';
