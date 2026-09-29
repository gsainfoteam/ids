import { use, useLayoutEffect } from 'react';

import { GroupContext } from './context';
import { menuStyle } from './style';
import { mergeProps, part } from '../../../utils';

import type { Menu } from '.';

export function MenuLabel({ asChild, className, children, ...props }: Menu.LabelProps) {
  const group = use(GroupContext);
  const setLabelled = group?.setLabelled;

  useLayoutEffect(() => {
    if (!setLabelled) return;

    setLabelled(true);
    return () => setLabelled(false);
  }, [setLabelled]);

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
