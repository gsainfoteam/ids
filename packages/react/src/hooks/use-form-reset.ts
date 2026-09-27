import { useEffect, useRef, type RefObject } from 'react';

type FormAssociated =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement
  | HTMLButtonElement;

// A native form reset rewrites each control's DOM value, but a component that keeps its own
// state would render the old value straight back. The handler runs after the reset event has
// finished dispatching, and not at all if a listener cancelled it.
export function useFormReset(ref: RefObject<FormAssociated | null>, onReset: () => void) {
  const latest = useRef(onReset);
  useEffect(() => {
    latest.current = onReset;
  });

  useEffect(() => {
    const form = ref.current?.form;
    if (!form) return;
    let mounted = true;
    const handle = (event: Event) =>
      queueMicrotask(() => {
        if (mounted && !event.defaultPrevented) latest.current();
      });
    form.addEventListener('reset', handle);
    return () => {
      mounted = false;
      form.removeEventListener('reset', handle);
    };
  }, [ref]);
}
