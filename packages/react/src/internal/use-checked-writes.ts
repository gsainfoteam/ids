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
  const committed = useRef(rendered);
  const writes = useRef<boolean[]>([]);
  const muted = useRef(false);

  const settle = useCallback((state: boolean) => {
    const pending = writes.current;
    writes.current = [];
    const outside = pending.reverse().find((value) => value !== state);
    if (outside !== undefined) latest.current(outside);
  }, []);

  useLayoutEffect(() => {
    latest.current = onWrite;
    committed.current = rendered;
    settle(rendered);
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
        if (muted.current) return;
        writes.current.push(get.call(input));
        if (writes.current.length === 1) queueMicrotask(() => settle(committed.current));
      },
    });
    latest.current(get.call(input));
    return () => {
      if (own) Object.defineProperty(input, 'checked', own);
      else Reflect.deleteProperty(input, 'checked');
    };
  }, [ref, settle]);

  return useCallback((write: () => void) => {
    muted.current = true;
    try {
      write();
    } finally {
      muted.current = false;
    }
  }, []);
}
