import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { CommandPalette } from './use-command';
import type { MenuLevel, MenuTriggerType } from './use-menu';

type RootContextValue = { root: MenuLevel; triggerType: MenuTriggerType };
type GroupContextValue = { labelId: string; setLabelled: (labelled: boolean) => void };
type RadioContextValue = { value: string | undefined; setValue: (value: string) => void };

export type ItemState = { checked: boolean; kind: 'checkbox' | 'radio' };

export const RootContext = createContext<RootContextValue | null>(null);
export const CommandContext = createContext<CommandPalette | null>(null);
export const LevelContext = createContext<MenuLevel | null>(null);
export const SubContext = createContext<MenuLevel | null>(null);
export const GroupContext = createContext<GroupContextValue | null>(null);
export const RadioContext = createContext<RadioContextValue | null>(null);
export const ItemContext = createContext<ItemState | null>(null);

export function useRootContext(part: string) {
  const context = use(RootContext);
  invariant(context, `${part} must be rendered inside Menu.`);
  return context;
}

export function useCommandContext(part: string) {
  const context = use(CommandContext);
  invariant(context, `${part} must be rendered inside Menu with triggerType="command".`);
  return context;
}

export function useLevelContext(part: string) {
  const context = use(LevelContext);
  invariant(context, `${part} must be rendered inside Menu.Content or Menu.SubContent.`);
  return context;
}

export function useSubContext(part: string) {
  const context = use(SubContext);
  invariant(context, `${part} must be rendered inside Menu.Sub.`);
  return context;
}

export function useRadioContext(part: string) {
  const context = use(RadioContext);
  invariant(context, `${part} must be rendered inside Menu.RadioGroup.`);
  return context;
}
