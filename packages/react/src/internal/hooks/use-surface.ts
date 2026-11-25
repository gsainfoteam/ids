'use client';

import {
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from 'react';

import { useInternalPressable } from './use-pressable';
import {
  interactiveDataProps,
  useInteractive,
  type InteractiveState,
} from '../../hooks/use-interactive';
import { isFromNestedControl } from '../lib/pressable';

export type SurfaceHandlers<E> = {
  onClick?: (event: MouseEvent<E>) => void;
  onKeyDown?: (event: KeyboardEvent<E>) => void;
  onKeyUp?: (event: KeyboardEvent<E>) => void;
  onFocus?: (event: FocusEvent<E>) => void;
  onBlur?: (event: FocusEvent<E>) => void;
  onPointerEnter?: (event: PointerEvent<E>) => void;
  onPointerLeave?: (event: PointerEvent<E>) => void;
  onPointerDown?: (event: PointerEvent<E>) => void;
  onPointerUp?: (event: PointerEvent<E>) => void;
  onPointerCancel?: (event: PointerEvent<E>) => void;
  onInteractionChange?: (state: InteractiveState) => void;
};

export type UseSurfaceOptions<E> = {
  interactive: boolean;
  asChild: boolean;
  disabled: boolean;
  titleIsTheButton?: boolean;
  handlers: SurfaceHandlers<E>;
};

export function useInternalSurface<E extends HTMLElement>({
  interactive,
  asChild,
  disabled,
  titleIsTheButton = false,
  handlers: { onClick, onKeyDown, onKeyUp, onBlur, onInteractionChange, ...pointer },
}: UseSurfaceOptions<E>) {
  const pressesThroughTheTitle = interactive && !asChild && titleIsTheButton;
  const press = useInternalPressable<E>({
    enabled: interactive && !asChild && !titleIsTheButton,
    disabled,
    onClick,
    onKeyDown,
    onKeyUp,
    onBlur,
  });
  const clickAnywhereButNestedControls = (event: MouseEvent<E>) => {
    if (disabled || isFromNestedControl(event)) return;
    onClick?.(event);
  };
  const { state, handlers } = useInteractive<E>({
    disabled,
    onInteractionChange,
    ...pointer,
    onKeyDown: press.onKeyDown,
    onKeyUp: press.onKeyUp,
    onBlur: press.onBlur,
  });
  return {
    interaction: state,
    props: {
      ...press,
      ...handlers,
      onClick: pressesThroughTheTitle ? clickAnywhereButNestedControls : press.onClick,
      ...(pressesThroughTheTitle && disabled ? { 'aria-disabled': true as const } : {}),
    },
    dataProps: interactive ? interactiveDataProps(state) : {},
  };
}
