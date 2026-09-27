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

// React writes a controlled value, react-hook-form's reset() and setValue() write input.value
// directly, and a native form reset restores the default; none of them fires an input event. The
// element's own value setter is wrapped so every one of them is seen. React's value tracker is
// such an own property too, so it is wrapped rather than replaced and restored on cleanup.
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
    const later = () =>
      queueMicrotask(() => {
        if (!alive) return;
        sync();
        external.current?.();
      });

    const { own, base } = valueDescriptor(node);
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
          later();
        },
      });
    }
    node.addEventListener('input', sync);
    node.addEventListener('change', sync);
    // The browser restores defaults right after the reset event, so the value is read a tick later.
    const form = node.form;
    form?.addEventListener('reset', later);

    return () => {
      alive = false;
      node.removeEventListener('input', sync);
      node.removeEventListener('change', sync);
      form?.removeEventListener('reset', later);
      if (!wrapped) return;
      if (own) Object.defineProperty(node, 'value', own);
      else Reflect.deleteProperty(node, 'value');
    };
  }, [ref, sync]);

  return value;
}
