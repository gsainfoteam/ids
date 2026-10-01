import type { ComponentProps, CSSProperties, ReactNode, Ref } from 'react';

import { FloatingButtonRoot } from './root';
import { floatingButtonStyle } from './style';
import { type FloatingPlacement } from './use-floating-button';
import { type ControlColorScheme } from '../../../internal/control-surface';

import type { InteractiveState, WithInteractiveValues } from '../../../hooks/use-interactive';
import type { IdsSize } from '../../../tokens/types';

export function FloatingButton(props: FloatingButton.Props) {
  return <FloatingButtonRoot {...props} />;
}

export namespace FloatingButton {
  export type State = InteractiveState;
  export type Variant = 'solid' | 'soft' | 'outline' | 'glossy';
  export type ColorScheme = ControlColorScheme;
  export type Placement = FloatingPlacement;

  type BaseProps = Omit<ComponentProps<'button'>, 'children' | 'className' | 'style' | 'ref'> & {
    ref?: Ref<HTMLElement>;
    variant?: Variant;
    colorScheme?: ColorScheme;
    size?: IdsSize;
    placement?: Placement;
    iconOnly?: boolean;
    children?: ReactNode;
    className?: string;
    style?: CSSProperties;
    onInteractionChange?: (state: State) => void;
  };

  export type Props = WithInteractiveValues<BaseProps> & {
    asChild?: boolean;
    focusableWhenDisabled?: boolean;
  };

  export const Style = floatingButtonStyle;
}

export { type FloatingButtonProps } from './root';
export type { FloatingPlacement } from './use-floating-button';
