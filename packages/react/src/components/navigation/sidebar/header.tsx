'use client';

import { type ComponentProps } from 'react';

import { useSidebarContext } from './context';
import { SidebarTrigger } from './trigger';
import { containsElementOfType } from '../../../utils';

export type SidebarHeaderProps = ComponentProps<'div'>;

const TRIGGER = new Set<unknown>([SidebarTrigger]);

export function SidebarHeader({ className, children, ...props }: SidebarHeaderProps) {
  const { styles, collapsible, presentation } = useSidebarContext('Sidebar.Header');
  const addsTrigger =
    (collapsible !== false || presentation === 'drawer') &&
    !containsElementOfType(children, TRIGGER);

  return (
    <div {...props} data-sidebar-header="" className={styles.header({ className })}>
      {children}
      {addsTrigger && <SidebarTrigger className="ms-auto" />}
    </div>
  );
}

SidebarHeader.displayName = 'Sidebar.Header';
