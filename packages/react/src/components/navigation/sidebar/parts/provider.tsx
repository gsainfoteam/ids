'use client';

import { type ComponentProps } from 'react';

import { Slot } from '../../../utility/slot';
import { SidebarProviderContext } from '../context';
import { useInternalSidebarProvider } from '../hooks/use-sidebar-provider';
import { sidebarStyle, type SidebarVariant } from '../style';

export type SidebarProviderProps = ComponentProps<'div'> & { asChild?: boolean };

export function SidebarProvider({
  sidebarVariant = 'sidebar',
  asChild,
  className,
  ...props
}: SidebarProviderProps & { sidebarVariant?: SidebarVariant }) {
  const provider = useInternalSidebarProvider(sidebarVariant);
  const Root = asChild ? Slot : 'div';

  return (
    <SidebarProviderContext value={provider}>
      <Root
        {...props}
        data-sidebar-provider=""
        className={sidebarStyle().provider({ className })}
      />
    </SidebarProviderContext>
  );
}

SidebarProvider.displayName = 'Sidebar.Provider';
