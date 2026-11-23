'use client';

import { useCallback, useEffect, useRef } from 'react';

import { spacerStyle } from './style';
import { mergeRefs } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';

import type { Spacer } from '.';

export function SpacerRoot({ className, ref, ...rest }: Spacer.Props) {
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

  return (
    <span
      {...rest}
      ref={mergedRef}
      aria-hidden="true"
      data-spacer=""
      className={spacerStyle({ className })}
    />
  );
}
