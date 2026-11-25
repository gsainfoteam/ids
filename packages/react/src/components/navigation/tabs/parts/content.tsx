'use client';

import { type ComponentProps } from 'react';

import { resolveState, type StateRenderProps } from '../../../../internal/lib/state-props';
import { contentIdOf, triggerIdOf } from '../context';
import { useInternalTabsContent } from '../hooks/use-tabs-content';

export type TabsContentState = { value: string; selected: boolean };

export type TabsContentProps<T extends string = string> = Omit<
  ComponentProps<'div'>,
  'children' | 'className' | 'style' | 'id' | 'role' | 'hidden'
> &
  StateRenderProps<TabsContentState> & {
    value: T;
    forceMount?: boolean;
  };

export function TabsContent<T extends string = string>({
  value,
  forceMount = false,
  className,
  style,
  children,
  ref,
  ...rest
}: TabsContentProps<T>) {
  const { tabs, selected, hidden, mounted, mergedRef } = useInternalTabsContent(
    value,
    forceMount,
    ref,
  );

  if (!mounted) return null;

  const state: TabsContentState = { value, selected };

  return (
    <div
      tabIndex={0}
      {...rest}
      ref={mergedRef}
      id={contentIdOf(tabs.id, value)}
      role="tabpanel"
      aria-labelledby={triggerIdOf(tabs.id, value)}
      hidden={hidden}
      data-orientation={tabs.orientation}
      data-selected={selected ? '' : undefined}
      className={tabs.styles.content({ className: resolveState(className, state) })}
      style={resolveState(style, state)}
    >
      {resolveState(children, state)}
    </div>
  );
}

TabsContent.displayName = 'Tabs.Content';
