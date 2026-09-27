import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import {
  formOf,
  readValidity,
  readValue,
  sameValidity,
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
    setValidity((prev) => (sameValidity(prev, next) ? prev : next));
  }, []);

  // Once an error is showing it follows every edit, so it clears the moment the value is valid.
  const notify = useCallback(() => {
    syncValue();
    if (shown.current) validate();
  }, [syncValue, validate]);

  // Controlled values, react-hook-form resets and a custom control's own state reach the DOM
  // without an input event, so the snapshot is also taken after every render.
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
      // Switching windows blurs without moving focus: the field is still where the user left it.
      if (!next && root.contains(doc.activeElement)) return;
      setFocused(false);
      setTouched(true);
      // A required field that was only tabbed past is reported on submit, not on blur.
      if (syncValue() || shown.current) validate();
    };
    // autoFocus runs during commit, before this listener exists.
    if (root.contains(doc.activeElement)) onFocusIn();

    root.addEventListener('input', notify);
    root.addEventListener('change', notify);
    root.addEventListener('focusin', onFocusIn);
    root.addEventListener('focusout', onFocusOut);
    // invalid does not bubble, but it does pass through ancestors in the capture phase.
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
        // Custom controls restore their own state after the reset event, so the new baseline is
        // read once they have rendered it.
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
