'use client';

import { useCallback, useEffect, useRef } from 'react';

import { spacerStyle } from './style';
import { invariant, mergeRefs } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';

import type { Spacer } from '.';

function resolve<T, S>(value: T | ((state: S) => T), state: S): T {
  return typeof value === 'function' ? (value as (state: S) => T)(state) : value;
}

export function SpacerRoot({ flex = 1, className, style, ref, ...rest }: Spacer.Props) {
  invariant(Number.isFinite(flex) && flex > 0, 'Spacer: flex must be a finite positive number.');
  const state: Spacer.State = { flex };
  const elementRef = useRef<HTMLSpanElement>(null);
  const mergedRef = useCallback(
    (node: HTMLSpanElement | null) => mergeRefs(elementRef, ref)(node),
    [ref],
  );

  useEffect(() => {
    const parent = elementRef.current?.parentElement;
    if (!isDevelopment || !parent) return;
    if (!getComputedStyle(parent).display.includes('flex'))
      console.warn('[IDS] Spacer: its parent is not a flex container, so it takes no space.');
  }, []);

  return (
    <span
      {...rest}
      ref={mergedRef}
      aria-hidden="true"
      data-spacer=""
      className={spacerStyle({ className: resolve(className, state) })}
      style={{ flexGrow: flex, ...resolve(style, state) }}
    />
  );
}
