import type { CSSProperties, Ref, RefCallback, SyntheticEvent } from 'react';

import { isFunction, isNotNil, isPlainObject, isString, union } from 'es-toolkit';

import { cn } from './cn';

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
    const cleanups = refs.map((ref) => {
      if (isFunction(ref)) {
        const cleanup = ref(value);
        return isFunction(cleanup) ? cleanup : () => ref(null);
      }
      if (isNotNil(ref)) {
        ref.current = value;
        return () => {
          ref.current = null;
        };
      }
      return undefined;
    });
    return () => cleanups.forEach((cleanup) => cleanup?.());
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
