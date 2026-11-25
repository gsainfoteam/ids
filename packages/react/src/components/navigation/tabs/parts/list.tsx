'use client';

import { type ComponentProps } from 'react';

import { useInternalTabsList } from '../hooks/use-tabs-list';

export type TabsListProps = Omit<ComponentProps<'div'>, 'role' | 'aria-orientation'>;

export function TabsList({ className, ref, children, ...rest }: TabsListProps) {
  const { tabs, mergedRef } = useInternalTabsList(ref);

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
