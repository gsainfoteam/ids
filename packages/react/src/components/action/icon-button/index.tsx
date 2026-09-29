import type { ComponentProps, CSSProperties, ReactElement } from 'react';

import { IconButtonRoot } from './root';
import { iconButtonStyle } from './style';
import { type ControlColorScheme } from '../../../internal/control-surface';

import type {
  InteractiveState,
  InteractiveValue,
  WithInteractiveValues,
} from '../../../hooks/use-interactive';
import type { IdsSize, IdsVariant } from '../../../tokens/types';

export function IconButton(props: IconButton.Props) {
  return <IconButtonRoot {...props} />;
}

export namespace IconButton {
  export type State = InteractiveState;
  export type Variant = IdsVariant;
  export type ColorScheme = ControlColorScheme;

  type BaseProps = Omit<ComponentProps<'button'>, 'children' | 'className' | 'style'> & {
    variant?: Variant;
    colorScheme?: ColorScheme;
    size?: IdsSize;
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

  export const Style = iconButtonStyle;
}
