import type { ComponentProps, CSSProperties, ReactNode } from 'react';

import { ToggleRoot } from './root';
import { toggleStyle } from './style';
import { type ControlColorScheme } from '../../../internal/control-surface';

import type { InteractiveState, WithInteractiveValues } from '../../../hooks/use-interactive';
import type { IdsSize, IdsVariant } from '../../../tokens/types';

export function Toggle(props: Toggle.Props) {
  return <ToggleRoot {...props} />;
}

export namespace Toggle {
  export type State = InteractiveState;
  export type Variant = IdsVariant;
  export type ColorScheme = ControlColorScheme;

  type BaseProps = Omit<ComponentProps<'button'>, 'children' | 'className' | 'style' | 'value'> & {
    variant?: Variant;
    colorScheme?: ColorScheme;
    size?: IdsSize;
    pressed?: boolean;
    defaultPressed?: boolean;
    onPressedChange?: (pressed: boolean) => void;
    value?: string;
    children?: ReactNode;
    className?: string;
    style?: CSSProperties;
    onInteractionChange?: (state: State) => void;
  };

  export type Props = WithInteractiveValues<BaseProps> & {
    asChild?: boolean;
    focusableWhenDisabled?: boolean;
  };

  export const Style = toggleStyle;
}
