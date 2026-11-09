'use client';

import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { SidebarCollapsibleMode, SidebarVariant, sidebarStyle } from './style';
import type { Hotkey } from '@tanstack/react-hotkeys';

export type SidebarControls = {
  collapsed: boolean;
  collapsible: SidebarCollapsibleMode | false;
  shortcut: Hotkey | false;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
};

export type SidebarPresentation = 'panel' | 'bar' | 'drawer';

export type SidebarContextValue = SidebarControls & {
  value: string | undefined;
  variant: SidebarVariant;
  presentation: SidebarPresentation;
  rail: boolean;
  styles: ReturnType<typeof sidebarStyle>;
  navigate: () => void;
};

export const SidebarContext = createContext<SidebarContextValue | null>(null);

export type PublishedSidebar = Pick<SidebarControls, 'collapsed' | 'collapsible' | 'shortcut'>;

export type SidebarProviderContextValue = {
  published: PublishedSidebar | null;
  publish: (sidebar: PublishedSidebar | null) => void;
  registerSetCollapsed: (setCollapsed: (collapsed: boolean) => void) => void;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
};

export const SidebarProviderContext = createContext<SidebarProviderContextValue | null>(null);

export const SidebarListContext = createContext(false);

export function useSidebarContext(part: string) {
  const context = use(SidebarContext);
  invariant(context, `\`<${part}>\` must be used inside \`<Sidebar>\`.`);
  return context;
}

const NOTHING_PUBLISHED: PublishedSidebar = {
  collapsed: false,
  collapsible: false,
  shortcut: false,
};

export function useSidebarControls(part: string): SidebarControls & { inside: boolean } {
  const sidebar = use(SidebarContext);
  const provider = use(SidebarProviderContext);
  invariant(
    sidebar || provider,
    `\`<${part}>\` must be used inside \`<Sidebar>\` or \`<Sidebar.Provider>\`.`,
  );
  if (sidebar) return { ...sidebar, inside: true };

  const published = provider!.published ?? NOTHING_PUBLISHED;
  return {
    ...published,
    setCollapsed: provider!.setCollapsed,
    mobileOpen: provider!.mobileOpen,
    setMobileOpen: provider!.setMobileOpen,
    inside: false,
  };
}
