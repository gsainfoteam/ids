'use client';

import { type ComponentProps } from 'react';

import { sidebarStyle } from './style';
import { Slot } from '../../utility/slot';

export type SidebarInsetProps = ComponentProps<'main'> & { asChild?: boolean };

export function SidebarInset({ asChild, className, ...props }: SidebarInsetProps) {
  const Root = asChild ? Slot : 'main';

  return <Root {...props} data-sidebar-inset="" className={sidebarStyle().inset({ className })} />;
}

SidebarInset.displayName = 'Sidebar.Inset';
