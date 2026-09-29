'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, type ComponentProps } from 'react';

import { flushSync } from 'react-dom';

import { contentIdOf, triggerIdOf, useTabsContext } from './context';
import { resolveState, type StateRenderProps } from '../../../internal/state-props';
import { mergeRefs } from '../../../utils';

export type TabsContentState = { value: string; selected: boolean };

export type TabsContentProps<T extends string = string> = Omit<
  ComponentProps<'div'>,
  'children' | 'className' | 'style' | 'id' | 'role' | 'hidden'
> &
  StateRenderProps<TabsContentState> & {
    value: T;
    forceMount?: boolean;
  };

function useFoundInPage(mounted: boolean, hidden: boolean, onFound: () => void) {
  const panelRef = useRef<HTMLDivElement>(null);
  const foundRef = useRef(onFound);

  useLayoutEffect(() => {
    foundRef.current = onFound;
  });

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (panel && hidden) panel.setAttribute('hidden', 'until-found');
  }, [hidden]);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const selectBeforeBrowserScrolls = () => flushSync(() => foundRef.current());
    panel.addEventListener('beforematch', selectBeforeBrowserScrolls);
    return () => panel.removeEventListener('beforematch', selectBeforeBrowserScrolls);
  }, [mounted]);

  return panelRef;
}

export function TabsContent<T extends string = string>({
  value,
  forceMount = false,
  className,
  style,
  children,
  ref,
  ...rest
}: TabsContentProps<T>) {
  const tabs = useTabsContext('Tabs.Content');
  const { registerContent } = tabs;
  useEffect(() => registerContent(value, forceMount), [registerContent, value, forceMount]);

  const selected = tabs.value === value;
  const hidden = !selected;
  const mounted = selected || forceMount;
  const panelRef = useFoundInPage(mounted, hidden, () => tabs.select(value));
  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => mergeRefs(panelRef, ref)(node),
    [panelRef, ref],
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
