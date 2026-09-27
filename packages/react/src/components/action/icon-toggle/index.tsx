import type { ComponentProps, CSSProperties, ReactElement } from 'react';

import { controlSurface, type ControlColorScheme } from '../../../internal/control-surface';
import { useIconLabel } from '../../../internal/icon-label';
import { iconSquare } from '../../../internal/icon-square';
import { toggleSurface } from '../../../internal/toggle-surface';
import { invariant, tv } from '../../../utils';
import { useGroupContext } from '../../utility/group';
import { useToggle } from '../toggle/use-toggle';

import type {
  InteractiveState,
  InteractiveValue,
  WithInteractiveValues,
} from '../../../hooks/use-interactive';
import type { IdsSize, IdsVariant } from '../../../tokens/types';

export function IconToggle(props: IconToggle.Props) {
  const layout = useGroupContext();
  const {
    props: { icon, variant: ownVariant, colorScheme, size, className, style, ...rest },
    toggleProps,
    element,
    content,
    render,
  } = useToggle(props, 'IconToggle');

  invariant(
    props.asChild || content == null,
    'IconToggle: pass the icon through the `icon` prop, not as children.',
  );
  invariant(icon != null || props.asChild, 'IconToggle: the `icon` prop is required.');

  const glyph = icon ?? content;
  const label = useIconLabel('IconToggle', glyph, rest, element?.props as object | undefined);
  const variant = ownVariant ?? layout?.variant ?? 'ghost';
  const resolvedSize = size ?? layout?.size ?? 'standard';

  return render(
    {
      ...rest,
      'aria-label': label ?? rest['aria-label'],
      ...toggleProps,
      className: IconToggle.Style({ variant, colorScheme, size: resolvedSize, className }),
      style,
      'data-variant': variant,
      'data-size': resolvedSize,
    },
    glyph,
  );
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

  export const Style = tv({
    base: [controlSurface.base, iconSquare.base],
    variants: {
      variant: toggleSurface.variant,
      colorScheme: controlSurface.colorScheme,
      size: iconSquare.size,
    },
    defaultVariants: {
      variant: 'ghost',
      colorScheme: 'primary',
      size: 'standard',
    },
  });
}
