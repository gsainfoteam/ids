'use client';

import { use } from 'react';

import { mergeProps } from '../../../../utils';
import { Divider } from '../../../layout/divider';
import { CommandContext } from '../context';
import { useInternalMenuSection } from '../hooks/use-menu-section';
import { menuStyle } from '../style';

import type { Menu } from '..';

export function MenuSeparator({ className, ...props }: Menu.SeparatorProps) {
  const palette = use(CommandContext);
  const section = useInternalMenuSection(palette);

  return (
    <Divider
      {...mergeProps(props, { ref: section.ref })}
      aria-hidden={!!palette}
      hidden={section.hidden || undefined}
      data-menu-separator=""
      className={menuStyle().separator({ className })}
    />
  );
}

MenuSeparator.displayName = 'Menu.Separator';
