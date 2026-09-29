'use client';

import { isValidElement, type ComponentProps, type CSSProperties, type ReactNode } from 'react';

import { CardAction, type CardActionProps } from './action';
import { CardContent, type CardContentProps } from './content';
import { CardContext } from './context';
import { CardDescription, type CardDescriptionProps } from './description';
import { CardFooter, type CardFooterProps } from './footer';
import { CardHeader, type CardHeaderProps } from './header';
import { CardMedia, type CardMediaProps } from './media';
import { type CardPartProps } from './part';
import { cardStyle } from './style';
import { CardTitle, type CardTitleProps } from './title';
import { useCard } from './use-card';
import { resolveState, type StateValue } from '../../../internal/state-props';
import { Slot } from '../../utility/slot';

import type { InteractiveState } from '../../../hooks/use-interactive';
import type { IdsSize } from '../../../tokens/types';

export type CardVariant = 'outline' | 'soft' | 'ghost';

function flag(on: boolean) {
  return on ? '' : undefined;
}

export function Card({
  variant = 'outline',
  size = 'standard',
  interactive: interactiveProp,
  disabled = false,
  asChild = false,
  className,
  style,
  children,
  onClick,
  onKeyDown,
  onKeyUp,
  onFocus,
  onBlur,
  onPointerEnter,
  onPointerLeave,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  onInteractionChange,
  ...rest
}: Card.Props) {
  const nativeControl =
    asChild && isValidElement(children) && (children.type === 'a' || children.type === 'button');
  const interactive = interactiveProp ?? (onClick != null || nativeControl);
  const { interaction, props, dataProps, labelling, register } = useCard<HTMLDivElement>({
    interactive,
    asChild,
    disabled,
    handlers: {
      onClick,
      onKeyDown,
      onKeyUp,
      onFocus,
      onBlur,
      onPointerEnter,
      onPointerLeave,
      onPointerDown,
      onPointerUp,
      onPointerCancel,
      onInteractionChange,
    },
  });
  const state: Card.State = { ...interaction, interactive };
  const styles = cardStyle({ variant, size, interactive });
  const Root = asChild ? Slot : 'div';

  return (
    <CardContext value={{ styles, ...register }}>
      <Root
        {...rest}
        {...props}
        {...labelling}
        {...(asChild && disabled
          ? { 'aria-disabled': true, onClick: (event) => event.preventDefault() }
          : {})}
        data-card=""
        data-variant={variant}
        data-size={size}
        data-interactive={flag(interactive)}
        data-disabled={flag(disabled)}
        {...dataProps}
        className={styles.root({ className: resolveState(className, state) })}
        style={resolveState(style, state)}
      >
        {resolveState(children, state)}
      </Root>
    </CardContext>
  );
}

export namespace Card {
  export type Variant = CardVariant;

  export type State = InteractiveState & { interactive: boolean };

  export type Props = Omit<ComponentProps<'div'>, 'className' | 'style' | 'children'> & {
    variant?: CardVariant;
    size?: IdsSize;
    interactive?: boolean;
    disabled?: boolean;
    asChild?: boolean;
    onInteractionChange?: (state: InteractiveState) => void;
    className?: StateValue<string | undefined, State>;
    style?: StateValue<CSSProperties | undefined, State>;
    children?: StateValue<ReactNode, State>;
  };

  export type PartProps = CardPartProps;

  export const Header = CardHeader;
  export namespace Header {
    export type Props = CardHeaderProps;
  }

  export const Title = CardTitle;
  export namespace Title {
    export type Props = CardTitleProps;
  }

  export const Description = CardDescription;
  export namespace Description {
    export type Props = CardDescriptionProps;
  }

  export const Action = CardAction;
  export namespace Action {
    export type Props = CardActionProps;
  }

  export const Content = CardContent;
  export namespace Content {
    export type Props = CardContentProps;
  }

  export const Footer = CardFooter;
  export namespace Footer {
    export type Props = CardFooterProps;
  }

  export const Media = CardMedia;
  export namespace Media {
    export type Props = CardMediaProps;
  }

  export const Style = cardStyle;
}
