'use client';

import { use } from 'react';

import { CommandItem } from './command';
import { mergeProps, part } from '../../../../utils';
import { CommandContext, useInternalContentContext, useInternalMenuContext } from '../context';
import { selectItem, useInternalMenuItem } from '../hooks/use-menu-item';
import { menuStyle } from '../style';

import type { Menu } from '..';

export function MenuItem(props: Menu.ItemProps) {
  if (use(CommandContext)) return <CommandItem {...props} />;

  return <PopupMenuItem {...props} />;
}

MenuItem.displayName = 'Menu.Item';

function PopupMenuItem({
  disabled = false,
  textValue,
  onSelect,
  asChild,
  className,
  children,
  ...props
}: Menu.ItemProps) {
  const { root } = useInternalMenuContext('Menu.Item');
  const level = useInternalContentContext('Menu.Item');
  const item = useInternalMenuItem(level, {
    disabled,
    textValue,
    activate: (element) => {
      if (selectItem(element, onSelect)) root.closeTree({ returnFocus: true });
    },
  });

  return part(
    'div',
    asChild,
    children,
    mergeProps(props, {
      ...item.props,
      role: 'menuitem',
      'data-menu-item': '',
      className: menuStyle().item({ className }),
    }),
  );
}
