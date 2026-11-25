'use client';

import { useCallback, useEffect, useRef, type Ref, type RefCallback } from 'react';

import { mergeRefs } from '../../../../utils';
import { isDevelopment } from '../../../../utils/dev';

export function useInternalSpacer(
  ref: Ref<HTMLSpanElement> | undefined,
): RefCallback<HTMLSpanElement> {
  const elementRef = useRef<HTMLSpanElement>(null);
  const mergedRef = useCallback(
    (node: HTMLSpanElement | null) => mergeRefs(elementRef, ref)(node),
    [ref],
  );

  useEffect(() => {
    const parent = elementRef.current?.parentElement;
    if (!isDevelopment || !parent) return;

    const checkOnceShown = new ResizeObserver(() => {
      const { display } = getComputedStyle(parent);
      if (display === 'none') return;
      checkOnceShown.disconnect();
      if (!display.includes('flex'))
        console.warn('[IDS] Spacer: its parent is not a flex container, so it takes no space.');
    });
    checkOnceShown.observe(parent);
    return () => checkOnceShown.disconnect();
  }, []);

  return mergedRef;
}
