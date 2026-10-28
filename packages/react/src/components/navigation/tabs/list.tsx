'use client';

import { useCallback, type ComponentProps } from 'react';

import { useTabsContext } from './context';
import { mergeRefs } from '../../../utils';

export type TabsListProps = Omit<ComponentProps<'div'>, 'role' | 'aria-orientation'> & {
  stretch?: boolean;
};

export function TabsList({ stretch = false, className, ref, children, ...rest }: TabsListProps) {
  const tabs = useTabsContext('Tabs.List');
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
      data-stretch={stretch ? '' : undefined}
      className={tabs.styles.list({ stretch, className })}
    >
      {children}
    </div>
  );
}

TabsList.displayName = 'Tabs.List';
