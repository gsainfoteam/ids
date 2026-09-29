import { use } from 'react';

import { CommandItem } from './command';
import { CommandContext, useContentContext, useMenuContext } from './context';
import { menuStyle } from './style';
import { selectItem, useMenuItem } from './use-menu-item';
import { mergeProps, part } from '../../../utils';

import type { Menu } from '.';

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
  const { root } = useMenuContext('Menu.Item');
  const level = useContentContext('Menu.Item');
  const item = useMenuItem(level, {
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
