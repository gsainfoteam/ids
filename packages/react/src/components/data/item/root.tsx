'use client';

import { isValidElement, use } from 'react';

import { ItemContext, ItemGroupContext } from './context';
import { itemStyle } from './style';
import { ItemTitle } from './title';
import { useItem } from './use-item';
import { resolveState } from '../../../internal/state-props';
import { containsElementOfType } from '../../../utils';
import { Slot } from '../../utility/slot';

import type { Item } from '.';

export type ItemVariant = 'ghost' | 'outline' | 'soft';

const ITEM_TITLE = new Set<unknown>([ItemTitle]);

function flag(on: boolean) {
  return on ? '' : undefined;
}

function isCurrent(value: unknown) {
  return value !== undefined && value !== false && value !== 'false';
}

export function ItemRoot({
  variant: variantProp,
  size,
  dense,
  interactive: interactiveProp,
  selected,
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
}: Item.Props) {
  const group = use(ItemGroupContext);
  const variant = variantProp ?? group?.variant ?? 'ghost';
  const resolvedSize = size ?? group?.size ?? 'standard';
  const resolvedDense = dense ?? group?.dense ?? false;
  const nativeControl =
    asChild && isValidElement(children) && (children.type === 'a' || children.type === 'button');
  const interactive = interactiveProp ?? (onClick != null || nativeControl);
  const titleIsTheButton = interactive && !asChild && containsElementOfType(children, ITEM_TITLE);
  const { interaction, props, dataProps, labelling, trigger, register } = useItem<HTMLDivElement>({
    interactive,
    asChild,
    disabled,
    titleIsTheButton,
    selected,
    current: isCurrent(rest['aria-current']),
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
  const state: Item.State = { ...interaction, interactive, selected: selected === true };
  const styles = itemStyle({ variant, size: resolvedSize, dense: resolvedDense, interactive });
  const Root = asChild ? Slot : 'div';

  return (
    <ItemContext value={{ styles, trigger, ...register }}>
      <Root
        {...rest}
        {...props}
        {...labelling}
        {...(asChild && disabled
          ? { 'aria-disabled': true, onClick: (event) => event.preventDefault() }
          : {})}
        data-item=""
        data-variant={variant}
        data-size={resolvedSize}
        data-dense={flag(resolvedDense)}
        data-interactive={flag(interactive)}
        data-selected={flag(selected === true)}
        data-disabled={flag(disabled)}
        {...dataProps}
        className={styles.root({ className: resolveState(className, state) })}
        style={resolveState(style, state)}
      >
        {resolveState(children, state)}
      </Root>
    </ItemContext>
  );
}
