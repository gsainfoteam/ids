import { type ComponentProps, type ReactNode } from 'react';

import {
  GroupRoot,
  GroupText,
  GroupSeparator,
  type GroupOrientation,
  type GroupContextValue,
} from './root';
import { groupStyle } from './style';

import type { IdsSize, IdsVariant } from '../../../tokens/types';

export function Group(props: Group.Props) {
  return <GroupRoot {...props} />;
}

export namespace Group {
  export type Props = ComponentProps<'div'> & {
    orientation?: GroupOrientation;
    attached?: boolean;
    size?: IdsSize;
    variant?: IdsVariant;
    separator?: GroupContextValue['separator'];
    children?: ReactNode;
  };

  export type SeparatorProps = Omit<
    ComponentProps<'div'>,
    'children' | 'role' | 'aria-orientation' | 'aria-hidden' | 'tabIndex'
  >;

  export type TextProps = ComponentProps<'div'> & { asChild?: boolean };

  export const Separator = GroupSeparator;

  export const Text = GroupText;

  export const Style = groupStyle;
}

export {
  useGroupContext,
  useGroupNameWarning,
  type GroupOrientation,
  type GroupContextValue,
} from './root';
