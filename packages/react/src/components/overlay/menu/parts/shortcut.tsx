'use client';

import { Kbd } from '../../../typography/kbd';
import { menuStyle } from '../style';

import type { Menu } from '..';

export function MenuShortcut({ className, ...props }: Menu.ShortcutProps) {
  return (
    <Kbd
      size="tiny"
      {...props}
      data-menu-shortcut=""
      className={menuStyle().shortcut({ className })}
    />
  );
}

MenuShortcut.displayName = 'Menu.Shortcut';
