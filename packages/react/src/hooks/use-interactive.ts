import { useState } from 'react';
import type { FocusEvent, KeyboardEvent, PointerEvent } from 'react';

export const INTERACTIVE_STATE_DEFAULTS = {
  hovered: false,
  active: false,
  focused: false,
  focusVisible: false,
  disabled: false,
};

export type InteractiveState = typeof INTERACTIVE_STATE_DEFAULTS;

const INTERACTIVE_INIT = {
  hovered: false,
  active: false,
  focused: false,
  focusVisible: false,
};

export type UseInteractiveOptions<E extends Element = Element> = {
  disabled?: boolean;
  onPointerEnter?: (e: PointerEvent<E>) => void;
  onPointerLeave?: (e: PointerEvent<E>) => void;
  onPointerDown?: (e: PointerEvent<E>) => void;
  onPointerUp?: (e: PointerEvent<E>) => void;
  onPointerCancel?: (e: PointerEvent<E>) => void;
  onFocus?: (e: FocusEvent<E>) => void;
  onBlur?: (e: FocusEvent<E>) => void;
  onKeyDown?: (e: KeyboardEvent<E>) => void;
  onKeyUp?: (e: KeyboardEvent<E>) => void;
};

export function useInteractive<E extends Element = Element>({
  disabled,
  onPointerEnter,
  onPointerLeave,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  onFocus,
  onBlur,
  onKeyDown,
  onKeyUp,
}: UseInteractiveOptions<E> = {}) {
  const [state, setState] = useState(INTERACTIVE_INIT);

  const handlers = {
    onPointerEnter(e: PointerEvent<E>) {
      if (!disabled && e.pointerType === 'mouse') setState((s) => ({ ...s, hovered: true }));
      onPointerEnter?.(e);
    },
    onPointerLeave(e: PointerEvent<E>) {
      if (e.pointerType === 'mouse') setState((s) => ({ ...s, hovered: false, active: false }));
      onPointerLeave?.(e);
    },
    onPointerDown(e: PointerEvent<E>) {
      if (!disabled) setState((s) => ({ ...s, active: true }));
      onPointerDown?.(e);
    },
    onPointerUp(e: PointerEvent<E>) {
      setState((s) => ({ ...s, active: false }));
      onPointerUp?.(e);
    },
    onPointerCancel(e: PointerEvent<E>) {
      setState((s) => ({ ...s, active: false, hovered: false }));
      onPointerCancel?.(e);
    },
    onFocus(e: FocusEvent<E>) {
      if (!disabled) {
        const focusVisible = e.currentTarget.matches(':focus-visible');
        setState((s) => ({ ...s, focused: true, focusVisible }));
      }
      onFocus?.(e);
    },
    onBlur(e: FocusEvent<E>) {
      setState((s) => ({ ...s, focused: false, focusVisible: false }));
      onBlur?.(e);
    },
    onKeyDown(e: KeyboardEvent<E>) {
      if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
        setState((s) => ({ ...s, active: true }));
      }
      onKeyDown?.(e);
    },
    onKeyUp(e: KeyboardEvent<E>) {
      if (e.key === 'Enter' || e.key === ' ') setState((s) => ({ ...s, active: false }));
      onKeyUp?.(e);
    },
  };

  return { state: { ...state, disabled: disabled ?? false }, handlers };
}

export type InteractiveHandlers<E extends Element = Element> = ReturnType<
  typeof useInteractive<E>
>['handlers'];

export const INTERACTIVE_HANDLER_KEYS = [
  'onPointerEnter',
  'onPointerLeave',
  'onPointerDown',
  'onPointerUp',
  'onPointerCancel',
  'onFocus',
  'onBlur',
  'onKeyDown',
  'onKeyUp',
] as const;

function kebabCase(key: string) {
  return key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

/** true인 state만 `data-hovered` 형태의 DOM props로 변환 */
export function interactiveDataProps(state: Record<string, boolean>) {
  return Object.fromEntries(
    Object.entries(state)
      .filter(([, value]) => value)
      .map(([key]) => [`data-${kebabCase(key)}`, ''] as const),
  ) as Record<`data-${string}`, ''>;
}
