'use client';

import { use, type ComponentProps } from 'react';

import { invariant } from '../../../../utils';
import { SidebarGroupContext, useInternalSidebarContext } from '../context';

export type SidebarGroupLabelProps = ComponentProps<'div'>;

export function SidebarGroupLabel({ className, children, ...props }: SidebarGroupLabelProps) {
  const { styles } = useInternalSidebarContext('Sidebar.Group.Label');
  const group = use(SidebarGroupContext);
  invariant(group, '`<Sidebar.Group.Label>` must be used inside `<Sidebar.Group>`.');

  if (group.inTrigger)
    return (
      <span {...props} className={className}>
        {children}
      </span>
    );

  return (
    <div {...props} id={group.labelId} className={styles.groupLabel({ className })}>
      {children}
    </div>
  );
}

SidebarGroupLabel.displayName = 'Sidebar.Group.Label';
