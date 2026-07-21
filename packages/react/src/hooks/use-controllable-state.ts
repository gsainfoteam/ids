import { useState } from 'react';

import { isFunction, isUndefined } from 'es-toolkit';

export type UseControllableStateOptions<T> = {
  value?: T;
  defaultValue: T;
  onChange?: (value: T) => void;
};

export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: UseControllableStateOptions<T>) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const isControlled = !isUndefined(value);
  const current = isControlled ? value : uncontrolled;

  function setValue(next: T | ((prev: T) => T)) {
    const resolved = isFunction(next) ? (next as (prev: T) => T)(current) : next;
    if (!isControlled) setUncontrolled(resolved);
    onChange?.(resolved);
  }

  return [current, setValue] as const;
}
