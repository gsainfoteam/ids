'use client';

import { useCallback, useInsertionEffect, useLayoutEffect, useRef, useState } from 'react';

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

  const rendered = useRef({ current, isControlled, onValueChange });
  useInsertionEffect(() => {
    rendered.current = { current, isControlled, onValueChange };
  });

  const reportedBeforeRender = useRef<{ value: T } | null>(null);
  useLayoutEffect(() => {
    reportedBeforeRender.current = null;
  });

  const setValue = useCallback(
    (next: T | ((prev: T) => T), options?: { silent?: boolean }) => {
      const { current, isControlled, onValueChange } = rendered.current;
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
    },
    [],
  );

  return [current, setValue] as const;
}
