import type { ComponentProps, CSSProperties, ReactNode } from 'react';

import { useToggle } from './use-toggle';
import { controlSurface, type ControlColorScheme } from '../../../internal/control-surface';
import { toggleSurface } from '../../../internal/toggle-surface';
import { tv } from '../../../utils';
import { useGroupContext } from '../../utility/group';

import type { InteractiveState, WithInteractiveValues } from '../../../hooks/use-interactive';
import type { IdsSize, IdsVariant } from '../../../tokens/types';

export function Toggle(props: Toggle.Props) {
  const layout = useGroupContext();
  const {
    props: { variant = 'ghost', colorScheme, size, className, style, ...rest },
    pressed,
    value,
    render,
  } = useToggle(props, 'Toggle');
  const resolvedSize = size ?? layout?.size ?? 'standard';

  return render({
    ...rest,
    'aria-pressed': pressed,
    'data-value': value,
    className: Toggle.Style({ variant, colorScheme, size: resolvedSize, className }),
    style,
    'data-variant': variant,
    'data-size': resolvedSize,
  });
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
    // Identifies the toggle inside a ToggleGroup, which then owns its pressed state.
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

  export const Style = tv({
    base: controlSurface.base,
    variants: {
      variant: toggleSurface.variant,
      colorScheme: controlSurface.colorScheme,
      size: toggleSurface.size,
    },
    defaultVariants: {
      variant: 'ghost',
      colorScheme: 'primary',
      size: 'standard',
    },
  });
}
