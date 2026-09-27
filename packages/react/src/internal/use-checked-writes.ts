import { useCallback, useLayoutEffect, useRef, type RefObject } from 'react';

function descriptorOf(node: object, key: string) {
  for (let proto: object | null = node; proto; proto = Object.getPrototypeOf(proto)) {
    const descriptor = Object.getOwnPropertyDescriptor(proto, key);
    if (descriptor) return descriptor;
  }
  return undefined;
}

// react-hook-form's register(), and any other code holding the element, writes input.checked
// directly on reset or setValue, and React never hears about it. The instance setter is wrapped so
// such a write is reported. Writes the component makes itself go through `silently` and are not
// reported.
//
// React writes through the same setter, on every commit and with the state it rendered, and it
// can write again before any microtask runs: register() writes from its ref callback during a
// commit, and a layout effect elsewhere can start a synchronous re-render that paints the stale
// state back over it. What the DOM holds afterwards therefore says nothing; each written value is
// kept instead and weighed against the state of the commit it belongs to. A value that differs
// from what React rendered did not come from React.
//
// register() also writes the default value from its ref callback during the very commit that
// mounts the input, before any effect could wrap the setter. The wrapper is therefore installed in
// a layout effect, which runs after the input's refs are attached, and the value found there is
// reported once; a passive effect would let a re-render paint the stale state over it first.
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

  // Refs are attached before the layout effects of the component that renders the input, so a
  // write from a ref callback in this commit is already queued here.
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
        // A write outside any commit is weighed once the task that made it is done.
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
