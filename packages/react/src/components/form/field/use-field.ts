'use client';

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
  const errorShowing = useRef(false);
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
    errorShowing.current = next !== null;
    setValidity((prev) => (isEqual(prev, next) ? prev : next));
  }, []);

  const notify = useCallback(() => {
    syncValue();
    if (errorShowing.current) validate();
  }, [syncValue, validate]);

  const rereadInOnChangeBatch = { onInput: notify, onChange: notify };

  useLayoutEffect(function catchValuesSetWithoutInputEvents() {
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
      const windowLostFocus = !next && root.contains(doc.activeElement);
      if (windowLostFocus) return;
      setFocused(false);
      setTouched(true);
      const edited = syncValue();
      if (edited || errorShowing.current) validate();
    };
    const focusedBeforeListening = root.contains(doc.activeElement);
    if (focusedBeforeListening) onFocusIn();

    root.addEventListener('focusin', onFocusIn);
    root.addEventListener('focusout', onFocusOut);
    root.addEventListener('invalid', validate, true);

    const form = formOf(root);
    let initialTimer = 0;
    let mounted = true;
    const rereadInitialOnceControlsRestore = () => {
      view.clearTimeout(initialTimer);
      initialTimer = view.setTimeout(() => {
        if (!mounted) return;
        initial.current = null;
        syncValue();
      }, 0);
    };
    const onReset = (event: Event) =>
      view.setTimeout(() => {
        if (!mounted || event.defaultPrevented) return;
        setTouched(false);
        errorShowing.current = false;
        setValidity(null);
        rereadInitialOnceControlsRestore();
      });
    form?.addEventListener('reset', onReset);

    return () => {
      mounted = false;
      view.clearTimeout(initialTimer);
      root.removeEventListener('focusin', onFocusIn);
      root.removeEventListener('focusout', onFocusOut);
      root.removeEventListener('invalid', validate, true);
      form?.removeEventListener('reset', onReset);
    };
  }, [syncValue, validate]);

  return {
    controlRef,
    rereadInOnChangeBatch,
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
