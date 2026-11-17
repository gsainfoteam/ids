'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { useHotkey, type Hotkey } from '@tanstack/react-hotkeys';

import { useControllableState } from '../../../hooks/use-controllable-state';
import { useDrawerPresentation } from '../../../internal/overlay';
import { isDevelopment } from '../../../utils/dev';

import type { SidebarControls, SidebarProviderContextValue } from './context';
import type { SidebarCollapsibleMode, SidebarVariant } from './style';

export const DEFAULT_SHORTCUT: Hotkey = 'Mod+B';

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;
const ONCE_PER_PRESS_OUTSIDE_INPUTS = {
  requireReset: true,
  ignoreInputs: true,
  stopPropagation: false,
} as const;

export function collapsibleModeOf(collapsible: boolean | SidebarCollapsibleMode | undefined) {
  if (collapsible === true) return 'icon';
  return collapsible ?? false;
}

export function useSmallScreen() {
  return useDrawerPresentation('drawer');
}

export function toggleSidebar(controls: SidebarControls, small: boolean) {
  if (small) controls.setMobileOpen(!controls.mobileOpen);
  else if (controls.collapsible) controls.setCollapsed(!controls.collapsed);
}

function writeCookie(name: string, collapsed: boolean) {
  document.cookie = `${name}=${collapsed}; path=/; max-age=${ONE_YEAR_IN_SECONDS}; samesite=lax`;
}

function usePersistedCollapse(name: string | undefined, collapsed: boolean) {
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (name) writeCookie(name, collapsed);
  }, [name, collapsed]);
}

function usePublishToProvider(
  provider: SidebarProviderContextValue | null,
  controls: Pick<SidebarControls, 'collapsed' | 'collapsible' | 'shortcut' | 'setCollapsed'>,
  variant: SidebarVariant,
) {
  const { collapsed, collapsible, shortcut, setCollapsed } = controls;
  const publish = provider?.publish;
  const register = provider?.registerSetCollapsed;

  useLayoutEffect(() => {
    register?.(setCollapsed);
  });

  useLayoutEffect(() => {
    if (!publish) return;
    publish({ collapsed, collapsible, shortcut, variant });
    return () => publish(null);
  }, [publish, collapsed, collapsible, shortcut, variant]);
}

function useMissingProviderWarning(
  hasProvider: boolean,
  variant: SidebarVariant,
  collapsible: SidebarCollapsibleMode | false,
) {
  useEffect(() => {
    if (!isDevelopment || hasProvider) return;
    if (collapsible === 'offcanvas')
      console.warn(
        '[IDS] `<Sidebar collapsible="offcanvas">` hides the whole sidebar, so the trigger that opens it again must sit outside it. Wrap the layout in `<Sidebar.Provider>` and place a `<Sidebar.Trigger>` in `<Sidebar.Inset>`.',
      );
    if (variant === 'inset')
      console.warn(
        '[IDS] `<Sidebar variant="inset">` draws the page as a card in `<Sidebar.Inset>`. Wrap the layout in `<Sidebar.Provider>` and put the page in `<Sidebar.Inset>`.',
      );
  }, [hasProvider, variant, collapsible]);
}

export type UseSidebarOptions = {
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  collapsible: SidebarCollapsibleMode | false;
  shortcut: Hotkey | false;
  persist?: string;
  variant: SidebarVariant;
  provider: SidebarProviderContextValue | null;
};

export function useSidebar({
  collapsed: collapsedProp,
  defaultCollapsed = false,
  onCollapsedChange,
  collapsible,
  shortcut,
  persist,
  variant,
  provider,
}: UseSidebarOptions): SidebarControls {
  const [collapsedState, setCollapsed] = useControllableState({
    value: collapsedProp,
    defaultValue: defaultCollapsed,
    onValueChange: onCollapsedChange,
  });
  const [ownMobileOpen, setOwnMobileOpen] = useState(false);
  const small = useSmallScreen();

  const mobileOpen = provider ? provider.mobileOpen : ownMobileOpen;
  const setMobileOpen = provider ? provider.setMobileOpen : setOwnMobileOpen;

  useEffect(() => {
    if (!small && mobileOpen) setMobileOpen(false);
  }, [small, mobileOpen, setMobileOpen]);

  const controls: SidebarControls = {
    collapsed: collapsible !== false && collapsedState,
    collapsible,
    shortcut,
    setCollapsed,
    mobileOpen,
    setMobileOpen,
  };

  usePersistedCollapse(persist, collapsedState);
  usePublishToProvider(provider, controls, variant);
  useMissingProviderWarning(provider !== null, variant, collapsible);
  useHotkey(shortcut || DEFAULT_SHORTCUT, () => toggleSidebar(controls, small), {
    ...ONCE_PER_PRESS_OUTSIDE_INPUTS,
    enabled: shortcut !== false,
  });

  return controls;
}
