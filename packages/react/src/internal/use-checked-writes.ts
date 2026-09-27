import { useCallback, useEffect, useLayoutEffect, useRef, type RefObject } from 'react';

function descriptorOf(node: object, key: string) {
  for (let proto: object | null = node; proto; proto = Object.getPrototypeOf(proto)) {
    const descriptor = Object.getOwnPropertyDescriptor(proto, key);
    if (descriptor) return descriptor;
  }
  return undefined;
}

// react-hook-form's register(), and any other code holding the element, writes input.checked
// directly on reset or setValue, and React never hears about it. The instance setter is wrapped so
// such a write is reported. React writes through the same setter, so the report waits until its
// commit is done: by then the DOM agrees with the rendered state and the caller finds nothing to
// adopt. Writes the component makes itself go through `silently` and are not reported.
export function useCheckedWrites(
  ref: RefObject<HTMLInputElement | null>,
  onWrite: (checked: boolean) => void,
) {
  const latest = useRef(onWrite);
  const muted = useRef(false);
  useLayoutEffect(() => {
    latest.current = onWrite;
  });

  useEffect(() => {
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
        queueMicrotask(() => latest.current(get.call(input)));
      },
    });
    return () => {
      if (own) Object.defineProperty(input, 'checked', own);
      else Reflect.deleteProperty(input, 'checked');
    };
  }, [ref]);

  return useCallback((write: () => void) => {
    muted.current = true;
    try {
      write();
    } finally {
      muted.current = false;
    }
  }, []);
}
