import type { CSSProperties, ReactNode, Ref, RefCallback, SyntheticEvent } from 'react';

import { isFunction, isNotNil, isPlainObject, isString, union } from 'es-toolkit';
import { castArray } from 'es-toolkit/compat';

import { cn } from './cn';

/** handler1 → (defaultPrevented면 중단) → handler2 */
export function mergeEventHandlers<E extends SyntheticEvent>(
  handler1: ((event: E) => void) | undefined,
  handler2: ((event: E) => void) | undefined,
): ((event: E) => void) | undefined {
  if (!handler1 && !handler2) return undefined;
  if (!handler1) return handler2;
  if (!handler2) return handler1;

  return (event: E) => {
    handler1(event);
    if (event.defaultPrevented) return;
    handler2(event);
  };
}

export function mergeRefs<T>(...refs: Array<Ref<T> | null | undefined>): RefCallback<T> {
  return (value) => {
    for (const ref of refs) {
      if (isFunction(ref)) ref(value);
      else if (isNotNil(ref)) ref.current = value;
    }
  };
}

function mergeObject<A extends object | undefined, B extends object | undefined>(
  a: A,
  b: B,
): A | B | (A & B) | undefined {
  if (a && !b) return a;
  if (!a && b) return b;
  if (a || b) return { ...a, ...b };
  return undefined;
}

export function mergeObjects(...objects: Array<object | undefined>): object | undefined {
  return objects.reduce<object | undefined>((acc, obj) => mergeObject(acc, obj), undefined);
}

function isEventHandlerKey(key: string): boolean {
  return /^on[A-Z]/.test(key);
}

function isRef(value: unknown): value is Ref<unknown> {
  if (isFunction(value)) return true;
  return isPlainObject(value) && 'current' in value;
}

function isStyle(value: unknown): value is CSSProperties {
  return isPlainObject(value);
}

/**
 * Slot / asChild용 props 합성.
 * - className: `cn`으로 병합
 * - style: shallow merge (next 우선)
 * - ref: `mergeRefs`
 * - on*: `mergeEventHandlers` (base → next, defaultPrevented 시 중단)
 * - 나머지: next ?? base
 */
export function mergeProps<P extends Record<string, unknown>, Q extends Record<string, unknown>>(
  baseProps: P,
  nextProps: Q,
): P & Q {
  const merged: Record<string, unknown> = {};
  const allKeys = union(Object.keys(baseProps), Object.keys(nextProps));
  if ('ref' in baseProps || 'ref' in nextProps) allKeys.push('ref');

  for (const key of allKeys) {
    const baseValue = baseProps[key];
    const nextValue = nextProps[key];

    if (key === 'className') {
      merged.className = cn(
        isString(baseValue) ? baseValue : undefined,
        isString(nextValue) ? nextValue : undefined,
      );
    } else if (key === 'style') {
      merged.style = mergeObjects(
        isStyle(baseValue) ? baseValue : undefined,
        isStyle(nextValue) ? nextValue : undefined,
      );
    } else if (key === 'ref') {
      merged.ref = mergeRefs(
        isRef(baseValue) ? baseValue : undefined,
        isRef(nextValue) ? nextValue : undefined,
      );
    } else if (isEventHandlerKey(key)) {
      merged[key] = mergeEventHandlers(
        isFunction(baseValue) ? baseValue : undefined,
        isFunction(nextValue) ? nextValue : undefined,
      );
    } else {
      merged[key] = nextValue ?? baseValue;
    }
  }

  return merged as P & Q;
}

/** Slot 형제가 있을 때 root child의 children 뒤에 이어 붙인다 */
export function mergeChildren(existing: ReactNode, ...extra: ReactNode[]): ReactNode {
  if (extra.length === 0) return existing;
  return [...castArray(existing), ...extra];
}
