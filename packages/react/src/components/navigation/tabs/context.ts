'use client';

import { createContext, use, type KeyboardEvent, type RefCallback } from 'react';

import { invariant } from '../../../utils';

import type { tabsStyle } from './style';

export type TabsOrientation = 'horizontal' | 'vertical';
export type TabsAppearance = 'underline' | 'pill' | 'enclosed';
export type TabsActivationMode = 'automatic' | 'manual';

export type TabsContextValue = {
  id: string;
  value: string | undefined;
  orientation: TabsOrientation;
  styles: ReturnType<typeof tabsStyle>;
  tabStop: string | null | undefined;
  keptMounted: ReadonlySet<string>;
  listRef: RefCallback<HTMLDivElement>;
  select: (value: string) => void;
  onTriggerFocus: (value: string) => void;
  onTriggerKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  registerTrigger: (value: string) => () => void;
  registerContent: (value: string, keepMounted: boolean) => () => void;
};

export const TabsContext = createContext<TabsContextValue | null>(null);

export function useTabsContext(part: string) {
  const context = use(TabsContext);
  invariant(context, `\`<${part}>\` must be used inside \`<Tabs>\`.`);
  return context;
}

function idSafe(value: string) {
  return encodeURIComponent(value);
}

export function triggerIdOf(id: string, value: string) {
  return `${id}-trigger-${idSafe(value)}`;
}

export function contentIdOf(id: string, value: string) {
  return `${id}-content-${idSafe(value)}`;
}
