'use client';

import { useCallback, useRef, useState, type ComponentProps } from 'react';

import { noop } from 'es-toolkit';

import { SidebarProviderContext, type PublishedSidebar } from './context';
import { sidebarStyle, type SidebarVariant } from './style';
import { Slot } from '../../utility/slot';

export type SidebarProviderProps = ComponentProps<'div'> & { asChild?: boolean };

export function SidebarProvider({
  sidebarVariant = 'sidebar',
  asChild,
  className,
  ...props
}: SidebarProviderProps & { sidebarVariant?: SidebarVariant }) {
  const [published, setPublished] = useState<PublishedSidebar | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const setCollapsedRef = useRef<(collapsed: boolean) => void>(noop);
  const registerSetCollapsed = useCallback((setCollapsed: (collapsed: boolean) => void) => {
    setCollapsedRef.current = setCollapsed;
  }, []);
  const setCollapsed = useCallback((collapsed: boolean) => setCollapsedRef.current(collapsed), []);
  const Root = asChild ? Slot : 'div';

  return (
    <SidebarProviderContext
      value={{
        variant: published?.variant ?? sidebarVariant,
        published,
        publish: setPublished,
        registerSetCollapsed,
        setCollapsed,
        mobileOpen,
        setMobileOpen,
      }}
    >
      <Root
        {...props}
        data-sidebar-provider=""
        className={sidebarStyle().provider({ className })}
      />
    </SidebarProviderContext>
  );
}

SidebarProvider.displayName = 'Sidebar.Provider';
