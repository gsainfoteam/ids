import { useEffect, useRef, type RefObject } from 'react';

type FormAssociated =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement
  | HTMLButtonElement;

function ownerForm(element: Element | null) {
  if (!element) return null;
  return 'form' in element ? (element as FormAssociated).form : element.closest('form');
}

export function useFormReset(ref: RefObject<Element | null>, onReset: () => void) {
  const latest = useRef(onReset);
  useEffect(() => {
    latest.current = onReset;
  });

  useEffect(() => {
    const form = ownerForm(ref.current);
    if (!form) return;
    let mounted = true;
    const afterResetUnlessCancelled = (event: Event) =>
      queueMicrotask(() => {
        if (mounted && !event.defaultPrevented) latest.current();
      });
    form.addEventListener('reset', afterResetUnlessCancelled);
    return () => {
      mounted = false;
      form.removeEventListener('reset', afterResetUnlessCancelled);
    };
  }, [ref]);
}
