import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';

type TextElement = HTMLInputElement | HTMLTextAreaElement;

function valueDescriptor(element: TextElement) {
  const own = Object.getOwnPropertyDescriptor(element, 'value');
  if (own) return { own, base: own };
  let proto: object | null = Object.getPrototypeOf(element);
  while (proto) {
    const inherited = Object.getOwnPropertyDescriptor(proto, 'value');
    if (inherited) return { own: undefined, base: inherited };
    proto = Object.getPrototypeOf(proto);
  }
  return { own: undefined, base: undefined };
}

export function useInputValue(
  ref: RefObject<TextElement | null>,
  initial: string,
  onExternalChange?: () => void,
) {
  const [value, setValue] = useState(initial);
  const external = useRef(onExternalChange);
  useLayoutEffect(() => {
    external.current = onExternalChange;
  });

  const sync = useCallback(() => {
    const node = ref.current;
    if (node) setValue(node.value);
  }, [ref]);

  useLayoutEffect(() => {
    sync();
  });

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let alive = true;
    const syncAndReport = () => {
      if (!alive) return;
      sync();
      external.current?.();
    };
    const syncOnceSettled = () => queueMicrotask(syncAndReport);
    const syncAfterBrowserRestoresValues = () => setTimeout(syncAndReport);

    const { own: reactValueTracker, base } = valueDescriptor(node);
    const wrapped = Boolean(base?.get && base.set);
    if (base?.get && base.set) {
      const { get, set } = base;
      Object.defineProperty(node, 'value', {
        configurable: true,
        enumerable: base.enumerable,
        get() {
          return get.call(this);
        },
        set(next: string) {
          set.call(this, next);
          syncOnceSettled();
        },
      });
    }
    node.addEventListener('input', sync);
    node.addEventListener('change', sync);
    const form = node.form;
    form?.addEventListener('reset', syncAfterBrowserRestoresValues);

    return () => {
      alive = false;
      node.removeEventListener('input', sync);
      node.removeEventListener('change', sync);
      form?.removeEventListener('reset', syncAfterBrowserRestoresValues);
      if (!wrapped) return;
      if (reactValueTracker) Object.defineProperty(node, 'value', reactValueTracker);
      else Reflect.deleteProperty(node, 'value');
    };
  }, [ref, sync]);

  return value;
}
