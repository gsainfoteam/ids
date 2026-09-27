import { useCallback, useEffect, useRef, type ComponentProps, type CSSProperties } from 'react';

import { invariant, mergeRefs, tv } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';

function resolve<T, S>(value: T | ((state: S) => T), state: S): T {
  return typeof value === 'function' ? (value as (state: S) => T)(state) : value;
}

// A span, not a div: it is valid inside a Button, a link or a label, where only phrasing content
// is allowed, and a flex container turns it into a block box anyway.
export function Spacer({ flex = 1, className, style, ref, ...rest }: Spacer.Props) {
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
      className={Spacer.Style({ className: resolve(className, state) })}
      style={{ flexGrow: flex, ...resolve(style, state) }}
    />
  );
}

export namespace Spacer {
  export type State = { flex: number };

  export type Props = Omit<
    ComponentProps<'span'>,
    'children' | 'role' | 'aria-hidden' | 'tabIndex' | 'className' | 'style'
  > & {
    flex?: number;
    className?: string | ((state: State) => string | undefined);
    style?: CSSProperties | ((state: State) => CSSProperties | undefined);
  };

  export const Style = tv({ base: 'block min-h-0 min-w-0 shrink basis-0' });
}
