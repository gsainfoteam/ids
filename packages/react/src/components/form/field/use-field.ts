import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { isEqual } from 'es-toolkit';

import {
  formOf,
  readValidity,
  readValue,
  validatesNatively,
  type FieldValidity,
} from './control-state';

export type UseFieldOptions = {
  dirty?: boolean;
  touched?: boolean;
};

export function useField({ dirty: dirtyProp, touched: touchedProp }: UseFieldOptions) {
  const controlRef = useRef<HTMLDivElement>(null);
  const initial = useRef<string | null>(null);
  const shown = useRef(false);
  const [focused, setFocused] = useState(false);
  const [touched, setTouched] = useState(false);
  const [value, setValue] = useState({ filled: false, dirty: false });
  const [validity, setValidity] = useState<FieldValidity | null>(null);

  const syncValue = useCallback(() => {
    const root = controlRef.current;
    if (!root) return false;
    const { signature, filled } = readValue(root);
    initial.current ??= signature;
    const dirty = signature !== initial.current;
    setValue((prev) => (prev.filled === filled && prev.dirty === dirty ? prev : { filled, dirty }));
    return dirty;
  }, []);

  const validate = useCallback(() => {
    const root = controlRef.current;
    if (!root) return;
    const next = validatesNatively(root) ? readValidity(root) : null;
    shown.current = next !== null;
    setValidity((prev) => (isEqual(prev, next) ? prev : next));
  }, []);

  const notify = useCallback(() => {
    syncValue();
    if (shown.current) validate();
  }, [syncValue, validate]);

  useLayoutEffect(() => {
    notify();
  });

  useEffect(() => {
    const root = controlRef.current;
    if (!root) return;
    const doc = root.ownerDocument;
    const view = doc.defaultView ?? window;

    const onFocusIn = () => setFocused(true);
    const onFocusOut = (event: FocusEvent) => {
      const next = event.relatedTarget as Node | null;
      if (next && root.contains(next)) return;
      if (!next && root.contains(doc.activeElement)) return;
      setFocused(false);
      setTouched(true);
      if (syncValue() || shown.current) validate();
    };
    if (root.contains(doc.activeElement)) onFocusIn();

    root.addEventListener('input', notify);
    root.addEventListener('change', notify);
    root.addEventListener('focusin', onFocusIn);
    root.addEventListener('focusout', onFocusOut);
    root.addEventListener('invalid', validate, true);

    const form = formOf(root);
    let timer = 0;
    let mounted = true;
    const onReset = (event: Event) =>
      queueMicrotask(() => {
        if (!mounted || event.defaultPrevented) return;
        setTouched(false);
        shown.current = false;
        setValidity(null);
        view.clearTimeout(timer);
        timer = view.setTimeout(() => {
          if (!mounted) return;
          initial.current = null;
          syncValue();
        }, 0);
      });
    form?.addEventListener('reset', onReset);

    return () => {
      mounted = false;
      view.clearTimeout(timer);
      root.removeEventListener('input', notify);
      root.removeEventListener('change', notify);
      root.removeEventListener('focusin', onFocusIn);
      root.removeEventListener('focusout', onFocusOut);
      root.removeEventListener('invalid', validate, true);
      form?.removeEventListener('reset', onReset);
    };
  }, [notify, syncValue, validate]);

  return {
    controlRef,
    notify,
    validity,
    state: {
      focused,
      filled: value.filled,
      dirty: dirtyProp ?? value.dirty,
      touched: touchedProp ?? touched,
    },
  };
}
