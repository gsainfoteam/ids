'use client';

import { isValidElement } from 'react';

import { CardContext } from './context';
import { cardStyle } from './style';
import { useCard } from './use-card';
import { resolveState } from '../../../internal/state-props';
import { Slot } from '../../utility/slot';

import type { Card } from '.';

export type CardVariant = 'outline' | 'soft' | 'ghost';

function flag(on: boolean) {
  return on ? '' : undefined;
}

export function CardRoot({
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
