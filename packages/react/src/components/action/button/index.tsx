import type { ComponentProps, CSSProperties, ReactNode } from 'react';

import { useButton } from './use-button';
import { controlSurface, type ControlColorScheme } from '../../../internal/control-surface';
import { tv } from '../../../utils';
import { useGroupContext } from '../../utility/group';

import type { InteractiveState, WithInteractiveValues } from '../../../hooks/use-interactive';
import type { IdsSize, IdsVariant } from '../../../tokens/types';

export function Button(props: Button.Props) {
  const group = useGroupContext();
  const {
    props: { variant: ownVariant, colorScheme, size, className, style, ...rest },
    render,
  } = useButton(props, 'Button', { checkContent: true });
  const variant = ownVariant ?? group?.variant ?? 'solid';
  const resolvedSize = size ?? group?.size ?? 'standard';

  return render({
    ...rest,
    className: Button.Style({ variant, colorScheme, size: resolvedSize, className }),
    style,
    'data-variant': variant,
    'data-size': resolvedSize,
  });
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

  export const Style = tv({
    base: controlSurface.base,
    variants: {
      variant: controlSurface.variant,
      colorScheme: controlSurface.colorScheme,
      size: controlSurface.size,
    },
    defaultVariants: {
      variant: 'solid',
      colorScheme: 'primary',
      size: 'standard',
    },
  });
}
