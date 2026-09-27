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

// A surface the user acts on as a whole: a card or a list row. A div with onClick becomes a
// button; with asChild the child (usually a link) keeps its own semantics and only gains the
// interaction states.
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
    // A static surface is not hoverable or pressable, so it carries no interaction attributes.
    dataProps: interactive ? interactiveDataProps(state) : {},
  };
}

// The title names an interactive surface and the description describes it; otherwise its whole
// text, buttons included, would be read out as one long name.
export function useLabelling(interactive: boolean) {
  const [titleId, setTitleId] = useState<string>();
  const [descriptionId, setDescriptionId] = useState<string>();
  return {
    labelling: interactive ? { 'aria-labelledby': titleId, 'aria-describedby': descriptionId } : {},
    register: { setTitleId, setDescriptionId },
  };
}

// A part registers its id with the surface while it is mounted, so the surface only points
// aria-labelledby and aria-describedby at parts that exist.
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
