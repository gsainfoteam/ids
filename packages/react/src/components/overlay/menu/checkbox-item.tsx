import { use } from 'react';

import { CommandCheckboxItem } from './command';
import { CommandContext, ItemContext, useContentContext, useMenuContext } from './context';
import { withIndicator } from './indicator';
import { menuStyle } from './style';
import { selectItem, useMenuItem } from './use-menu-item';
import { mergeProps, part } from '../../../utils';

import type { Menu } from '.';

export function MenuCheckboxItem(props: Menu.CheckboxItemProps) {
  if (use(CommandContext)) return <CommandCheckboxItem {...props} />;

  return <PopupMenuCheckboxItem {...props} />;
}

MenuCheckboxItem.displayName = 'Menu.CheckboxItem';

function PopupMenuCheckboxItem({
  checked = false,
  onCheckedChange,
  disabled = false,
  textValue,
  onSelect,
  asChild,
  className,
  children,
  ...props
}: Menu.CheckboxItemProps) {
  const { root } = useMenuContext('Menu.CheckboxItem');
  const level = useContentContext('Menu.CheckboxItem');
  const item = useMenuItem(level, {
    disabled,
    textValue,
    activate: (element) => {
      onCheckedChange?.(!checked);
      if (selectItem(element, onSelect)) root.closeTree({ returnFocus: true });
    },
  });

  return (
    <ItemContext value={{ checked, kind: 'checkbox' }}>
      {part(
        'div',
        asChild,
        withIndicator(children, asChild),
        mergeProps(props, {
          ...item.props,
          role: 'menuitemcheckbox',
          'aria-checked': checked,
          'data-checked': checked ? '' : undefined,
          'data-menu-item': '',
          className: menuStyle().item({ checkable: true, className }),
        }),
      )}
    </ItemContext>
  );
}
