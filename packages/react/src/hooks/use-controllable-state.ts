'use client';

import { useState } from 'react';

import { isEqual, isFunction, isUndefined } from 'es-toolkit';

export type UseControllableStateOptions<T> = {
  value?: T;
  defaultValue: T;
  onValueChange?: (value: T) => void;
};

export function useControllableState<T>({
  value,
  defaultValue,
  onValueChange,
}: UseControllableStateOptions<T>) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const isControlled = !isUndefined(value);
  const current = isControlled ? value : uncontrolled;

  function setValue(next: T | ((prev: T) => T), options?: { silent?: boolean }) {
    const resolved = isFunction(next) ? next(current) : next;
    const sameEvenIfRebuilt = isEqual(resolved, current);
    if (sameEvenIfRebuilt) return;
    if (!isControlled) setUncontrolled(resolved);
    if (options?.silent !== true) onValueChange?.(resolved);
  }

  return [current, setValue] as const;
}
