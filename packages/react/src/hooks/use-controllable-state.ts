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

  // A native form reset changes the value without a change event, so a component restoring its
  // default on reset passes `silent` and the consumer is not told about an edit that never happened.
  function setValue(next: T | ((prev: T) => T), options?: { silent?: boolean }) {
    const resolved = isFunction(next) ? next(current) : next;
    // Sliders and groups rebuild their array or Set on every move or click, so reference
    // equality alone would report changes that did not happen.
    if (isEqual(resolved, current)) return;
    if (!isControlled) setUncontrolled(resolved);
    if (options?.silent !== true) onValueChange?.(resolved);
  }

  return [current, setValue] as const;
}
