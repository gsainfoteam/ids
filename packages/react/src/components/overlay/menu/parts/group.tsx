'use client';

import { use } from 'react';

import { mergeProps, part } from '../../../../utils';
import { CommandContext, GroupContext } from '../context';
import { useInternalMenuGroupLabel } from '../hooks/use-menu-group-label';
import { useInternalMenuSection } from '../hooks/use-menu-section';
import { menuStyle } from '../style';

import type { Menu } from '..';

export function MenuGroup({ asChild, className, children, ...props }: Menu.GroupProps) {
  const palette = use(CommandContext);
  const { labelId, labelled, setLabelled } = useInternalMenuGroupLabel();
  const section = useInternalMenuSection(palette);

  return (
    <GroupContext value={{ labelId, setLabelled }}>
      {part(
        'div',
        asChild,
        children,
        mergeProps(props, {
          ref: section.ref,
          role: 'group',
          hidden: section.hidden || undefined,
          'aria-labelledby': props['aria-labelledby'] ?? (labelled ? labelId : undefined),
          'data-menu-group': '',
          className: menuStyle().group({ className }),
        }),
      )}
    </GroupContext>
  );
}

MenuGroup.displayName = 'Menu.Group';
