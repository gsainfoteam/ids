'use client';

import { type ComponentProps } from 'react';

import { useInternalSidebarContext } from '../context';

export type SidebarFooterProps = ComponentProps<'div'>;

export function SidebarFooter({ className, ...props }: SidebarFooterProps) {
  const { styles } = useInternalSidebarContext('Sidebar.Footer');

  return <div {...props} data-sidebar-footer="" className={styles.footer({ className })} />;
}

SidebarFooter.displayName = 'Sidebar.Footer';
