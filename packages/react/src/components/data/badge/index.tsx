import type { ComponentProps, CSSProperties, ReactNode } from 'react';

import {
  BadgeRoot,
  type BadgePlacement,
  type BadgeShape,
  type BadgeVariant,
  type BadgeColorScheme,
} from './root';
import { badgeStyle } from './style';
import { type StateValue } from '../../../internal/state-props';

import type { IdsSize } from '../../../tokens/types';

export function Badge(props: Badge.Props) {
  return <BadgeRoot {...props} />;
}

export namespace Badge {
  export type Placement = BadgePlacement;
  export type Shape = BadgeShape;
  export type Variant = BadgeVariant;
  export type ColorScheme = BadgeColorScheme;

  export type State = {
    count: number | undefined;
    dot: boolean;
    invisible: boolean;
    overflowed: boolean;
  };

  export type Props = Omit<ComponentProps<'span'>, 'className' | 'style' | 'content'> & {
    content?: ReactNode;
    dot?: boolean;
    max?: number;
    showZero?: boolean;
    invisible?: boolean;
    placement?: BadgePlacement;
    shape?: BadgeShape;
    variant?: BadgeVariant;
    colorScheme?: BadgeColorScheme;
    size?: IdsSize;
    className?: StateValue<string | undefined, State>;
    style?: StateValue<CSSProperties | undefined, State>;
    children?: ReactNode;
  };

  export const Style = badgeStyle;
}

export {
  type BadgePlacement,
  type BadgeShape,
  type BadgeVariant,
  type BadgeColorScheme,
} from './root';
