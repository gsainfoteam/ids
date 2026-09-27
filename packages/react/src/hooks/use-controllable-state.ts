import { useState } from 'react';

import { isFunction, isUndefined } from 'es-toolkit';

export type UseControllableStateOptions<T> = {
  value?: T;
  defaultValue: T;
  onValueChange?: (value: T) => void;
};

// Slider and group components rebuild their array or Set on every pointer move or click, so
// reference equality alone would report a change that did not happen.
function isSameValue(a: unknown, b: unknown) {
  if (Object.is(a, b)) return true;
  if (Array.isArray(a) && Array.isArray(b))
    return a.length === b.length && a.every((item, index) => Object.is(item, b[index]));
  if (a instanceof Set && b instanceof Set)
    return a.size === b.size && [...a].every((item) => b.has(item));
  return false;
}

export function useControllableState<T>({
  value,
  defaultValue,
  onValueChange,
}: UseControllableStateOptions<T>) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const isControlled = !isUndefined(value);
  const current = isControlled ? value : uncontrolled;

  function setValue(next: T | ((prev: T) => T)) {
    const resolved = isFunction(next) ? next(current) : next;
    if (isSameValue(resolved, current)) return;
    if (!isControlled) setUncontrolled(resolved);
    onValueChange?.(resolved);
  }

  return [current, setValue] as const;
}
