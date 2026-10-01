import type { ComponentProps, CSSProperties, ReactNode } from 'react';

import { ButtonRoot } from './root';
import { buttonStyle } from './style';
import { type ControlColorScheme } from '../../../internal/control-surface';

import type { InteractiveState, WithInteractiveValues } from '../../../hooks/use-interactive';
import type { IdsSize, IdsVariant } from '../../../tokens/types';

export function Button(props: Button.Props) {
  return <ButtonRoot {...props} />;
}

export namespace Button {
  export type State = InteractiveState;
  export type Variant = IdsVariant;
  export type ColorScheme = ControlColorScheme;

  type BaseProps = Omit<ComponentProps<'button'>, 'children' | 'className' | 'style'> & {
    variant?: Variant;
    colorScheme?: ColorScheme;
    size?: IdsSize;
    children?: ReactNode;
    className?: string;
    style?: CSSProperties;
    onInteractionChange?: (state: State) => void;
  };

  export type Props = WithInteractiveValues<BaseProps> & {
    asChild?: boolean;
    focusableWhenDisabled?: boolean;
  };

  export const Style = buttonStyle;
}
