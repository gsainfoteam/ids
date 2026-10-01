'use client';

import { useLayoutEffect, useRef, useState } from 'react';

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

  const reportedBeforeRender = useRef<{ value: T } | null>(null);
  useLayoutEffect(() => {
    reportedBeforeRender.current = null;
  });

  function setValue(next: T | ((prev: T) => T), options?: { silent?: boolean }) {
    const latest = reportedBeforeRender.current ? reportedBeforeRender.current.value : current;
    const resolved = isFunction(next) ? next(latest) : next;
    const sameEvenIfRebuilt = isEqual(resolved, latest);
    if (sameEvenIfRebuilt) return;
    const report = { value: resolved };
    reportedBeforeRender.current = report;
    setTimeout(() => {
      if (reportedBeforeRender.current === report) reportedBeforeRender.current = null;
    });
    if (!isControlled) setUncontrolled(resolved);
    if (options?.silent !== true) onValueChange?.(resolved);
  }

  return [current, setValue] as const;
}
