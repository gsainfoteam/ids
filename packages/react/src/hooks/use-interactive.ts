import { useLayoutEffect, useRef, useState } from 'react';
import type { FocusEvent, KeyboardEvent, PointerEvent } from 'react';

import { isFunction, pickBy } from 'es-toolkit';

export const INTERACTIVE_STATE_DEFAULTS = {
  hovered: false,
  active: false,
  focused: false,
  focusVisible: false,
  pressed: false,
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
  pressed?: boolean;
  /** 컴포넌트가 소유한 InteractiveState를 부모에 mirror. 구독/controlled가 아님. */
  onInteractionChange?: (state: InteractiveState) => void;
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
  pressed,
  onInteractionChange,
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
  const interactiveState: InteractiveState = {
    ...state,
    pressed: pressed ?? false,
    disabled: disabled ?? false,
  };

  const onInteractionChangeRef = useRef(onInteractionChange);

  useLayoutEffect(() => {
    onInteractionChangeRef.current = onInteractionChange;
  });

  useLayoutEffect(() => {
    onInteractionChangeRef.current?.({
      hovered: state.hovered,
      active: state.active,
      focused: state.focused,
      focusVisible: state.focusVisible,
      pressed: pressed ?? false,
      disabled: disabled ?? false,
    });
  }, [
    state.hovered,
    state.active,
    state.focused,
    state.focusVisible,
    pressed,
    disabled,
  ]);

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

  return {
    state: interactiveState,
    handlers,
  };
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

/** true인 state만 `data-hovered` 형태의 DOM props로 변환.
 *  동일 속성(bg 등)을 두고 싸우지 않도록 DOM에는 pressed > active > hovered 우선순위로 하나만 올린다.
 *  render prop의 `state`는 원시값 그대로 유지한다. */
export function interactiveDataProps(state: Record<string, boolean>) {
  const { hovered, active, pressed, ...rest } = state;
  const forDom = {
    ...rest,
    pressed: Boolean(pressed),
    active: Boolean(active && !pressed),
    hovered: Boolean(hovered && !active && !pressed),
  };

  return Object.fromEntries(
    Object.keys(pickBy(forDom, Boolean)).map((key) => [`data-${kebabCase(key)}`, ''] as const),
  ) as Record<`data-${string}`, ''>;
}

/** 값 또는 InteractiveState를 받는 함수 */
export type InteractiveValue<T> = T | ((state: InteractiveState) => T);

type ExcludedInteractiveKey =
  | `on${string}`
  | 'ref'
  | 'disabled'
  | 'key'
  | 'formAction'
  | 'pressed'
  | 'defaultPressed'
  | 'onPressedChange'
  | 'value';

type HasFunction<T> =
  Extract<NonNullable<T>, (...args: never[]) => unknown> extends never ? false : true;

/**
 * prop을 `T | ((state) => T)`로 확장.
 * 이벤트 핸들러·이미 함수인 prop·ref·disabled·key는 그대로 둔다.
 */
export type WithInteractiveValues<P> = {
  [K in keyof P]: K extends ExcludedInteractiveKey
    ? P[K]
    : HasFunction<P[K]> extends true
      ? P[K]
      : P[K] | ((state: InteractiveState) => P[K]);
};

/** state render fn을 제거한 resolve 결과 타입 */
export type ResolvedInteractiveValues<P> = {
  [K in keyof P]: [Exclude<P[K], (state: InteractiveState) => unknown>] extends [never]
    ? P[K]
    : Exclude<P[K], (state: InteractiveState) => unknown>;
};

export function resolveInteractiveValue<T>(
  value: InteractiveValue<T> | undefined,
  state: InteractiveState,
): T | undefined {
  return isFunction(value) ? (value as (state: InteractiveState) => T)(state) : value;
}

/** `onClick` 등 이벤트 핸들러·`formAction`·`ref`는 state render fn이 아님 */
const SKIP_RESOLVE = /^(on[A-Z].*|formAction|ref)$/;

/** 객체 prop을 state로 resolve. 이벤트/`formAction` 함수는 그대로 통과. */
export function resolveInteractiveProps<P extends Record<string, unknown>>(
  props: P,
  state: InteractiveState,
): ResolvedInteractiveValues<P> {
  const resolved = { ...props };

  for (const key of Object.keys(props)) {
    const value = props[key];
    if (isFunction(value) && SKIP_RESOLVE.test(key)) continue;
    if (isFunction(value)) {
      (resolved as Record<string, unknown>)[key] = value(state);
    }
  }

  return resolved as ResolvedInteractiveValues<P>;
}

const INTERACTIVE_OPTION_KEYS = [
  ...INTERACTIVE_HANDLER_KEYS,
  'disabled',
  'pressed',
  'onInteractionChange',
] as const;

function pickInteractiveOptions<E extends Element>(
  props: Record<string, unknown>,
): UseInteractiveOptions<E> {
  const options: Record<string, unknown> = {};
  for (const key of INTERACTIVE_OPTION_KEYS) {
    if (key in props) options[key] = props[key];
  }
  return options as UseInteractiveOptions<E>;
}

function omitInteractiveHandlers<P extends Record<string, unknown>>(props: P) {
  const rest = { ...props };
  for (const key of INTERACTIVE_HANDLER_KEYS) {
    delete rest[key];
  }
  return rest as Omit<P, (typeof INTERACTIVE_HANDLER_KEYS)[number]>;
}

const NON_DOM_KEYS = [
  'pressed',
  'defaultPressed',
  'onPressedChange',
  'onInteractionChange',
] as const;

function omitNonDomProps<P extends Record<string, unknown>>(props: P) {
  const rest = { ...props };
  for (const key of NON_DOM_KEYS) {
    delete rest[key];
  }
  return rest;
}

/**
 * 인터랙션 state/handlers + prop resolve를 한 번에 처리.
 * 컴포넌트는 반환된 `props`만 쓰면 된다.
 */
export function useInteractiveProps<E extends Element = Element, P extends object = object>(
  props: P,
) {
  const record = props as P & Record<string, unknown>;
  const { state, handlers } = useInteractive<E>(pickInteractiveOptions<E>(record));
  const resolved = omitNonDomProps(
    resolveInteractiveProps(omitInteractiveHandlers(record), state) as Record<string, unknown>,
  );

  return {
    state,
    handlers,
    props: resolved as ResolvedInteractiveValues<
      Omit<P, (typeof INTERACTIVE_HANDLER_KEYS)[number] | (typeof NON_DOM_KEYS)[number]>
    >,
    dataProps: interactiveDataProps(state),
  };
}
