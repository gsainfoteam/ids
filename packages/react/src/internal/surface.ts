'use client';

import {
  useCallback,
  useId,
  useLayoutEffect,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from 'react';

import { usePressable } from './pressable';
import {
  interactiveDataProps,
  useInteractive,
  type InteractiveState,
} from '../hooks/use-interactive';

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
  handlers: SurfaceHandlers<E>;
};

export function useSurface<E extends HTMLElement>({
  interactive,
  asChild,
  disabled,
  handlers: { onClick, onKeyDown, onKeyUp, onBlur, onInteractionChange, ...pointer },
}: UseSurfaceOptions<E>) {
  const press = usePressable<E>({
    enabled: interactive && !asChild,
    disabled,
    onClick,
    onKeyDown,
    onKeyUp,
    onBlur,
  });
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
    props: { ...press, ...handlers, onClick: press.onClick },
    dataProps: interactive ? interactiveDataProps(state) : {},
  };
}

export function useLabelling(interactive: boolean) {
  const [titleId, setTitleId] = useState<string>();
  const [descriptionId, setDescriptionId] = useState<string>();
  return {
    labelling: interactive ? { 'aria-labelledby': titleId, 'aria-describedby': descriptionId } : {},
    register: { setTitleId, setDescriptionId },
  };
}

export function useRegisteredId(
  register: ((id: string | undefined) => void) | undefined,
  own?: string,
) {
  const generated = useId();
  const id = own ?? generated;
  const stable = useCallback((value: string | undefined) => register?.(value), [register]);
  useLayoutEffect(() => {
    stable(id);
    return () => stable(undefined);
  }, [id, stable]);
  return id;
}
