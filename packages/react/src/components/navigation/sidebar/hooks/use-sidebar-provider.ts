'use client';

import { useCallback, useRef, useState } from 'react';

import { noop } from 'es-toolkit';

import type { PublishedSidebar, SidebarProviderContextValue } from '../context';
import type { SidebarVariant } from '../style';

export function useInternalSidebarProvider(
  sidebarVariant: SidebarVariant,
): SidebarProviderContextValue {
  const [published, setPublished] = useState<PublishedSidebar | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const setCollapsedRef = useRef<(collapsed: boolean) => void>(noop);
  const registerSetCollapsed = useCallback((setCollapsed: (collapsed: boolean) => void) => {
    setCollapsedRef.current = setCollapsed;
  }, []);
  const setCollapsed = useCallback((collapsed: boolean) => setCollapsedRef.current(collapsed), []);

  return {
    variant: published?.variant ?? sidebarVariant,
    published,
    publish: setPublished,
    registerSetCollapsed,
    setCollapsed,
    mobileOpen,
    setMobileOpen,
  };
}
