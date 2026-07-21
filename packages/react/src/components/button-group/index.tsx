import type { ComponentProps, ReactNode } from 'react';

import { GroupRoot, GroupSeparator } from '../group';

import type { StackDirection } from '../../layout/types';
import type { IdsSize } from '../../tokens/types';

export function ButtonGroup({
  orientation = 'horizontal',
  size = 'standard',
  className,
  children,
  ...rest
}: ButtonGroup.Props) {
  return (
    <GroupRoot orientation={orientation} size={size} className={className} {...rest}>
      {children}
    </GroupRoot>
  );
}

export namespace ButtonGroup {
  export const Separator = GroupSeparator;

  export type Props = Omit<ComponentProps<'div'>, 'children' | 'className'> & {
    orientation?: StackDirection;
    size?: IdsSize;
    className?: string;
    children?: ReactNode;
  };
}
