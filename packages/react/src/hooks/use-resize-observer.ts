'use client';

import { useEffectEvent, useLayoutEffect, type RefObject } from 'react';

type Target<T extends Element> = T | RefObject<T | null> | null;

const elementOf = <T extends Element>(target: Target<T>) =>
  target && 'current' in target ? target.current : target;

export function useInternalResizeObserver<T extends Element>(
  target: Target<T>,
  onResize: (element: T) => void,
) {
  const resized = useEffectEvent(onResize);

  useLayoutEffect(() => {
    const element = elementOf(target);
    if (!element || typeof ResizeObserver === 'undefined') return;

    resized(element);
    const observer = new ResizeObserver(() => resized(element));
    observer.observe(element);
    return () => observer.disconnect();
  }, [target]);
}
