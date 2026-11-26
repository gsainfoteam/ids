'use client';

import { CardContext } from './context';
import { useInternalCard } from './hooks/use-card';
import { CardTitle } from './parts/title';
import { cardStyle } from './style';
import { useInternalPressableChild } from '../../../internal/hooks/use-pressable-child';
import { resolveState } from '../../../internal/lib/state-props';
import { containsElementOfType, mergeRefs } from '../../../utils';
import { Slot } from '../../utility/slot';

import type { Card } from '.';

export type CardVariant = 'outline' | 'soft' | 'ghost';

const CARD_TITLE = new Set<unknown>([CardTitle]);

function flag(on: boolean) {
  return on ? '' : undefined;
}

export function CardRoot({
  variant = 'outline',
  size = 'standard',
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
  ref,
  ...rest
}: Card.Props) {
  const child = useInternalPressableChild<HTMLDivElement>(asChild, children);
  const interactive = onClick != null || child.pressable;
  const titleIsTheButton = interactive && !asChild && containsElementOfType(children, CARD_TITLE);
  const { interaction, props, dataProps, labelling, descriptionId, register } =
    useInternalCard<HTMLDivElement>({
      interactive,
      asChild,
      disabled,
      titleIsTheButton,
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
    <CardContext
      value={{
        styles,
        trigger: titleIsTheButton ? { disabled, describedBy: descriptionId } : null,
        ...register,
      }}
    >
      <Root
        {...rest}
        ref={mergeRefs(ref, child.ref)}
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
