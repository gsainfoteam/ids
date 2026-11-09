'use client';

import { use, type ComponentProps } from 'react';

import { SidebarProviderContext } from './context';
import { sidebarStyle } from './style';
import { Card } from '../../data/card';
import { Slot } from '../../utility/slot';

export type SidebarInsetProps = ComponentProps<'main'> & { asChild?: boolean };

export function SidebarInset({ asChild, className, ...props }: SidebarInsetProps) {
  const provider = use(SidebarProviderContext);
  const card = provider?.variant === 'inset';
  const Root = asChild ? Slot : 'main';
  const insetClassName = sidebarStyle({ card }).inset({ className });

  if (!card) return <Root {...props} data-sidebar-inset="" className={insetClassName} />;

  return (
    <Card asChild variant="outline" className={insetClassName}>
      <Root {...props} data-sidebar-inset="" />
    </Card>
  );
}

SidebarInset.displayName = 'Sidebar.Inset';
