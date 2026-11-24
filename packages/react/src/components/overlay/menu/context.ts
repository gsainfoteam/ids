'use client';

import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { CommandPalette } from './hooks/use-command';
import type { MenuLevel, MenuTriggerType } from './hooks/use-menu';

type MenuContextValue = { level: MenuLevel; root: MenuLevel; triggerType: MenuTriggerType };
type GroupContextValue = { labelId: string; setLabelled: (labelled: boolean) => void };
type RadioContextValue = { value: string | undefined; setValue: (value: string) => void };

export type ItemState = { checked: boolean; kind: 'checkbox' | 'radio' };

export const MenuContext = createContext<MenuContextValue | null>(null);
export const ContentContext = createContext<MenuLevel | null>(null);
export const CommandContext = createContext<CommandPalette | null>(null);
export const GroupContext = createContext<GroupContextValue | null>(null);
export const RadioContext = createContext<RadioContextValue | null>(null);
export const ItemContext = createContext<ItemState | null>(null);

export function useInternalMenuContext(part: string) {
  const context = use(MenuContext);
  invariant(context, `${part} must be rendered inside Menu.`);

  return context;
}

export function useInternalCommandContext(part: string) {
  const context = use(CommandContext);
  invariant(context, `${part} must be rendered inside Menu with triggerType="command".`);

  return context;
}

export function useInternalContentContext(part: string) {
  const context = use(ContentContext);
  invariant(context, `${part} must be rendered inside Menu.Content.`);

  return context;
}

export function useInternalRadioContext(part: string) {
  const context = use(RadioContext);
  invariant(context, `${part} must be rendered inside Menu.RadioGroup.`);

  return context;
}
