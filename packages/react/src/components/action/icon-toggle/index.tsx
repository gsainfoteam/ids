import type { ComponentProps, CSSProperties, ReactElement } from 'react';

import { IconToggleRoot } from './root';
import { iconToggleStyle } from './style';
import { type ControlColorScheme } from '../../../internal/control-surface';

import type {
  InteractiveState,
  InteractiveValue,
  WithInteractiveValues,
} from '../../../hooks/use-interactive';
import type { IdsSize, IdsVariant } from '../../../tokens/types';

export function IconToggle(props: IconToggle.Props) {
  return <IconToggleRoot {...props} />;
}

export namespace IconToggle {
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
    className?: string;
    style?: CSSProperties;
    onInteractionChange?: (state: State) => void;
  };

  export type Props = WithInteractiveValues<BaseProps> & {
    focusableWhenDisabled?: boolean;
  } & (
      | {
          asChild?: false;
          icon: InteractiveValue<ReactElement>;
          children?: never;
        }
      | {
          asChild: true;
          icon?: InteractiveValue<ReactElement>;
          children: InteractiveValue<ReactElement>;
        }
    );

  export const Style = iconToggleStyle;
}
