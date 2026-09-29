import { use, useState } from 'react';

import { CommandContext } from './context';
import { menuStyle } from './style';
import { mergeProps } from '../../../utils';
import { Divider } from '../../layout/divider';

import type { Menu } from '.';

export function MenuSeparator({ className, ...props }: Menu.SeparatorProps) {
  const palette = use(CommandContext);
  const [element, setElement] = useState<HTMLElement | null>(null);

  const hidden = !!element && !!palette?.hiddenSections.has(element);

  return (
    <Divider
      {...mergeProps(props, { ref: palette ? setElement : undefined })}
      decorative={!!palette}
      hidden={hidden || undefined}
      data-menu-separator=""
      className={menuStyle().separator({ className })}
    />
  );
}

MenuSeparator.displayName = 'Menu.Separator';
