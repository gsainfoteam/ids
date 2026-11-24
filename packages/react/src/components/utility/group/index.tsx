import { type ComponentProps, type ReactNode } from 'react';

import { GroupRoot, GroupSeparator, type GroupOrientation, type GroupContextValue } from './root';
import { groupStyle } from './style';

import type { SurfaceVariant } from '../../../internal/surfaces/control-surface';
import type { IdsSize } from '../../../tokens/types';

export function Group(props: Group.Props) {
  return <GroupRoot {...props} />;
}

export namespace Group {
  export type Props = ComponentProps<'div'> & {
    orientation?: GroupOrientation;
    size?: IdsSize;
    variant?: SurfaceVariant;
    separator?: GroupContextValue['separator'];
    children?: ReactNode;
  };

  export type SeparatorProps = Omit<
    ComponentProps<'div'>,
    'role' | 'aria-orientation' | 'aria-hidden' | 'tabIndex'
  >;

  export const Separator = GroupSeparator;

  export const Style = groupStyle;
}

export {
  useGroupContext,
  useGroupNameWarning,
  type GroupOrientation,
  type GroupContextValue,
} from './root';
