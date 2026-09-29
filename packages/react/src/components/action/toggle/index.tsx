'use client';

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
    props: { variant: ownVariant, colorScheme, size, className, style, ...rest },
    toggleProps,
    render,
  } = useToggle(props, 'Toggle');
  const variant = ownVariant ?? layout?.variant ?? 'ghost';
  const resolvedSize = size ?? layout?.size ?? 'standard';

  return render({
    ...rest,
    ...toggleProps,
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
      size: controlSurface.size,
    },
    defaultVariants: {
      variant: 'ghost',
      colorScheme: 'primary',
      size: 'standard',
    },
  });
}
