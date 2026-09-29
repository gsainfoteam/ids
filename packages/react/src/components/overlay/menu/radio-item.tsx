'use client';

import { use } from 'react';

import { CommandRadioItem } from './command';
import {
  CommandContext,
  ItemContext,
  useContentContext,
  useMenuContext,
  useRadioContext,
} from './context';
import { withIndicator } from './indicator';
import { menuStyle } from './style';
import { selectItem, useMenuItem } from './use-menu-item';
import { mergeProps, part } from '../../../utils';

import type { Menu } from '.';

export function MenuRadioItem(props: Menu.RadioItemProps) {
  if (use(CommandContext)) return <CommandRadioItem {...props} />;

  return <PopupMenuRadioItem {...props} />;
}

MenuRadioItem.displayName = 'Menu.RadioItem';

function PopupMenuRadioItem({
  value,
  disabled = false,
  textValue,
  onSelect,
  asChild,
  className,
  children,
  ...props
}: Menu.RadioItemProps) {
  const { root } = useMenuContext('Menu.RadioItem');
  const level = useContentContext('Menu.RadioItem');
  const group = useRadioContext('Menu.RadioItem');

  const checked = group.value === value;
  const item = useMenuItem(level, {
    disabled,
    textValue,
    activate: (element) => {
      group.setValue(value);
      if (selectItem(element, onSelect)) root.closeTree({ returnFocus: true });
    },
  });

  return (
    <ItemContext value={{ checked, kind: 'radio' }}>
      {part(
        'div',
        asChild,
        withIndicator(children, asChild),
        mergeProps(props, {
          ...item.props,
          role: 'menuitemradio',
          'aria-checked': checked,
          'data-checked': checked ? '' : undefined,
          'data-menu-item': '',
          className: menuStyle().item({ checkable: true, className }),
        }),
      )}
    </ItemContext>
  );
}
