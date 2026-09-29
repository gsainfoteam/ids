'use client';

import { useCallback, useLayoutEffect, useRef, type RefObject } from 'react';

function descriptorOf(node: object, key: string) {
  for (let proto: object | null = node; proto; proto = Object.getPrototypeOf(proto)) {
    const descriptor = Object.getOwnPropertyDescriptor(proto, key);
    if (descriptor) return descriptor;
  }
  return undefined;
}

export function useCheckedWrites(
  ref: RefObject<HTMLInputElement | null>,
  rendered: boolean,
  onWrite: (checked: boolean) => void,
) {
  const latest = useRef(onWrite);
  const renderedAtCommit = useRef(rendered);
  const writesToWeigh = useRef<boolean[]>([]);
  const writingSilently = useRef(false);

  const weighWritesAgainst = useCallback((renderedState: boolean) => {
    const pending = writesToWeigh.current;
    writesToWeigh.current = [];
    const lastWriteNotFromReact = pending.reverse().find((value) => value !== renderedState);
    if (lastWriteNotFromReact !== undefined) latest.current(lastWriteNotFromReact);
  }, []);

  useLayoutEffect(() => {
    latest.current = onWrite;
    renderedAtCommit.current = rendered;
    weighWritesAgainst(rendered);
  });

  useLayoutEffect(() => {
    const input = ref.current;
    if (!input) return;
    const own = Object.getOwnPropertyDescriptor(input, 'checked');
    const base = own ?? descriptorOf(input, 'checked');
    if (!base?.get || !base.set) return;
    const { get, set } = base;
    Object.defineProperty(input, 'checked', {
      configurable: true,
      enumerable: base.enumerable,
      get() {
        return get.call(this);
      },
      set(next: boolean) {
        set.call(this, next);
        if (writingSilently.current) return;
        writesToWeigh.current.push(get.call(input));
        const firstSinceLastWeighing = writesToWeigh.current.length === 1;
        if (firstSinceLastWeighing)
          queueMicrotask(() => weighWritesAgainst(renderedAtCommit.current));
      },
    });
    const writtenBeforeWrapping = get.call(input);
    latest.current(writtenBeforeWrapping);
    return () => {
      if (own) Object.defineProperty(input, 'checked', own);
      else Reflect.deleteProperty(input, 'checked');
    };
  }, [ref, weighWritesAgainst]);

  return useCallback((write: () => void) => {
    writingSilently.current = true;
    try {
      write();
    } finally {
      writingSilently.current = false;
    }
  }, []);
}
