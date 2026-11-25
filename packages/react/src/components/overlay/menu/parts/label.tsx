'use client';

import { use } from 'react';

import { mergeProps, part } from '../../../../utils';
import { GroupContext } from '../context';
import { useInternalMenuLabelPresence } from '../hooks/use-menu-label-presence';
import { menuStyle } from '../style';

import type { Menu } from '..';

export function MenuLabel({ asChild, className, children, ...props }: Menu.LabelProps) {
  const group = use(GroupContext);

  useInternalMenuLabelPresence(group?.setLabelled);

  return part(
    'div',
    asChild,
    children,
    mergeProps(props, {
      id: props.id ?? group?.labelId,
      'data-menu-label': '',
      className: menuStyle().label({ className }),
    }),
  );
}

MenuLabel.displayName = 'Menu.Label';
