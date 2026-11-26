import { type ComponentProps, type CSSProperties, type ReactNode } from 'react';

import { type AvatarGroupLayout, type AvatarGroupStacking } from './lib/arrange';
import { AvatarGroupRoot, AvatarGroupOverflow } from './root';
import { avatarGroupStyle } from './style';
import { type StateValue } from '../../../internal/lib/state-props';

import type { IdsSize } from '../../../tokens/types';

type AvatarGroupOverflowState = { count: number };

type AvatarGroupOverflowProps = Omit<
  ComponentProps<'span'>,
  'className' | 'style' | 'children' | 'role'
> & {
  max?: number;
  total?: number;
  className?: StateValue<string | undefined, AvatarGroupOverflowState>;
  style?: StateValue<CSSProperties | undefined, AvatarGroupOverflowState>;
  children?: StateValue<ReactNode, AvatarGroupOverflowState>;
};

export function AvatarGroup(props: AvatarGroup.Props) {
  return <AvatarGroupRoot {...props} />;
}

export namespace AvatarGroup {
  export type Layout = AvatarGroupLayout;
  export type Stacking = AvatarGroupStacking;

  export type State = {
    visible: number;
    hidden: number;
    layout: AvatarGroupLayout;
    stacking: AvatarGroupStacking;
    size: IdsSize;
  };

  export type Props = Omit<ComponentProps<'ul'>, 'className' | 'style' | 'children'> & {
    layout?: AvatarGroupLayout;
    stacking?: AvatarGroupStacking;
    size?: IdsSize;
    className?: StateValue<string | undefined, State>;
    style?: StateValue<CSSProperties | undefined, State>;
    children?: ReactNode;
  };

  export type OverflowProps = AvatarGroupOverflowProps;

  export const Overflow = AvatarGroupOverflow;

  export namespace Overflow {
    export type State = AvatarGroupOverflowState;

    export type Props = AvatarGroupOverflowProps;
  }

  export const Style = avatarGroupStyle;
}
export type { AvatarGroupLayout, AvatarGroupStacking } from './lib/arrange';
