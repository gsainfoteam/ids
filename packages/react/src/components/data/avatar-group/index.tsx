import { type ComponentProps, type CSSProperties, type ReactNode } from 'react';

import { type AvatarGroupLayout, type AvatarGroupStacking } from './arrange';
import { AvatarGroupRoot, AvatarGroupOverflow } from './root';
import { avatarGroupStyle } from './style';
import { type StateValue } from '../../../internal/state-props';
import { type AvatarShape } from '../avatar/context';

import type { IdsSize } from '../../../tokens/types';

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
    shape: AvatarShape;
  };

  export type Props = Omit<ComponentProps<'div'>, 'className' | 'style' | 'children'> & {
    max?: number;
    total?: number;
    layout?: AvatarGroupLayout;
    stacking?: AvatarGroupStacking;
    size?: IdsSize;
    shape?: AvatarShape;
    overflowLabel?: (count: number) => string;
    className?: StateValue<string | undefined, State>;
    style?: StateValue<CSSProperties | undefined, State>;
    children?: ReactNode;
  };

  export const Overflow = AvatarGroupOverflow;

  export namespace Overflow {
    export type State = { count: number };

    export type Props = Omit<
      ComponentProps<'span'>,
      'className' | 'style' | 'children' | 'role'
    > & {
      className?: StateValue<string | undefined, State>;
      style?: StateValue<CSSProperties | undefined, State>;
      children?: StateValue<ReactNode, State>;
    };
  }

  export const Style = avatarGroupStyle;
}
export type { AvatarGroupLayout, AvatarGroupStacking } from './arrange';
