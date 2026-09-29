import { use, useId, useState } from 'react';

import { CommandContext, GroupContext } from './context';
import { menuStyle } from './style';
import { mergeProps, part } from '../../../utils';

import type { Menu } from '.';

export function MenuGroup({ asChild, className, children, ...props }: Menu.GroupProps) {
  const palette = use(CommandContext);
  const labelId = useId();
  const [labelled, setLabelled] = useState(false);
  const [element, setElement] = useState<HTMLElement | null>(null);

  const hidden = !!element && !!palette?.hiddenSections.has(element);

  return (
    <GroupContext value={{ labelId, setLabelled }}>
      {part(
        'div',
        asChild,
        children,
        mergeProps(props, {
          ref: palette ? setElement : undefined,
          role: 'group',
          hidden: hidden || undefined,
          'aria-labelledby': props['aria-labelledby'] ?? (labelled ? labelId : undefined),
          'data-menu-group': '',
          className: menuStyle().group({ className }),
        }),
      )}
    </GroupContext>
  );
}

MenuGroup.displayName = 'Menu.Group';
