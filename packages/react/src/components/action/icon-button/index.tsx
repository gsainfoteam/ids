import type { ComponentProps, CSSProperties, ReactElement } from 'react';

import { controlSurface, type ControlColorScheme } from '../../../internal/control-surface';
import { useIconLabel } from '../../../internal/icon-label';
import { iconSquare } from '../../../internal/icon-square';
import { invariant, tv } from '../../../utils';
import { useGroupContext } from '../../utility/group';
import { useButton } from '../button/use-button';

import type {
  InteractiveState,
  InteractiveValue,
  WithInteractiveValues,
} from '../../../hooks/use-interactive';
import type { IdsSize, IdsVariant } from '../../../tokens/types';

export function IconButton(props: IconButton.Props) {
  const group = useGroupContext();
  const {
    props: { icon, variant: ownVariant, colorScheme, size, className, style, ...rest },
    element,
    content,
    render,
  } = useButton(props, 'IconButton');

  invariant(
    props.asChild || content == null,
    'IconButton: pass the icon through the `icon` prop, not as children.',
  );
  invariant(icon != null || props.asChild, 'IconButton: the `icon` prop is required.');

  const glyph = icon ?? content;
  const label = useIconLabel('IconButton', glyph, rest, element?.props as object | undefined);
  const variant = ownVariant ?? group?.variant ?? 'ghost';
  const resolvedSize = size ?? group?.size ?? 'standard';

  return render(
    {
      ...rest,
      'aria-label': label ?? rest['aria-label'],
      className: IconButton.Style({ variant, colorScheme, size: resolvedSize, className }),
      style,
      'data-variant': variant,
      'data-size': resolvedSize,
    },
    glyph,
  );
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
          // The child element (a link) is drawn as the square; its content, or `icon`, is the icon.
          asChild: true;
          icon?: InteractiveValue<ReactElement>;
          children: InteractiveValue<ReactElement>;
        }
    );

  export const Style = tv({
    base: [controlSurface.base, iconSquare.base],
    variants: {
      variant: controlSurface.variant,
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
