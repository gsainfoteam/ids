import { useCallback, useId, useLayoutEffect, useRef, useState, type FocusEvent } from 'react';

import { useControllableState } from '../../hooks/use-controllable-state';
import { useFormReset } from '../../hooks/use-form-reset';

export type TemporalFieldState<V> = {
  value: V;
  open: boolean;
  empty: boolean;
  disabled: boolean;
  readOnly: boolean;
  invalid: boolean;
  required: boolean;
};

export type TemporalChange<V> = (value: V, options?: { close?: boolean }) => void;

export type UseTemporalFieldOptions<V> = {
  value: V | undefined;
  defaultValue: V;
  onValueChange?: (value: V) => void;
  empty: V;
  isEmpty: (value: V) => boolean;
  isSame: (a: V, b: V) => boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled: boolean;
  readOnly: boolean;
  invalid: boolean | undefined;
  required: boolean;
  // Typed for the trigger, but also called with the popup's blur event when focus leaves there.
  onBlur?: (event: FocusEvent<HTMLButtonElement>) => void;
};

export function useTemporalField<V>(options: UseTemporalFieldOptions<V>) {
  const { empty, isEmpty, isSame, disabled, readOnly, required } = options;
  // The value is kept here rather than in useControllableState because a form reset must put
  // the default back without reporting it as a change, the way a native input resets.
  const [inner, setInner] = useState(options.defaultValue);
  const controlled = options.value !== undefined;
  const value = controlled ? (options.value as V) : inner;
  const [open, setOpen] = useControllableState({
    value: options.open,
    defaultValue: options.defaultOpen ?? false,
    onValueChange: options.onOpenChange,
  });
  const blocked = disabled || readOnly;
  const expanded = open && !blocked;
  const popupId = `ids-temporal-${useId()}`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const commit = (next: V) => {
    if (isSame(next, value)) return;
    if (!controlled) setInner(next);
    options.onValueChange?.(next);
  };

  // FieldPopup re-runs its placement and initial focus whenever onClose changes identity, so
  // close must stay the same function for the life of the field. It also hears both the
  // pointerdown and the focusin of one outside click, which must report a single close.
  const latest = useRef({ setOpen, open: expanded });
  useLayoutEffect(() => {
    latest.current = { setOpen, open: expanded };
  });
  const close = useCallback((restoreFocus: boolean) => {
    if (latest.current.open) {
      latest.current.open = false;
      latest.current.setOpen(false);
    }
    if (restoreFocus) triggerRef.current?.focus({ preventScroll: true });
  }, []);

  const change: TemporalChange<V> = (next, { close: shouldClose = false } = {}) => {
    if (blocked) return;
    commit(next);
    if (shouldClose) close(true);
  };

  const clear = () => {
    if (blocked) return;
    commit(empty);
    close(true);
  };

  useFormReset(triggerRef, () => {
    if (!controlled) setInner(options.defaultValue);
    setOpen(false);
  });

  // Focus moving between the trigger and its popup stays inside the field, so blur is only
  // reported once it leaves both.
  const inside = (target: EventTarget | null) =>
    target instanceof Node &&
    (!!rootRef.current?.contains(target) ||
      !!(target as Element).closest?.(`[data-temporal-owner="${popupId}"]`));
  const onBlur = (event: FocusEvent<HTMLElement>) => {
    if (!inside(event.relatedTarget))
      options.onBlur?.(event as unknown as FocusEvent<HTMLButtonElement>);
  };

  const state: TemporalFieldState<V> = {
    value,
    open: expanded,
    empty: isEmpty(value),
    disabled,
    readOnly,
    invalid: options.invalid ?? false,
    required,
  };

  return {
    state,
    blocked,
    popupId,
    triggerRef,
    rootRef,
    change,
    clear,
    close,
    toggle: () => {
      if (!blocked) setOpen(!expanded);
    },
    show: () => {
      if (!blocked) setOpen(true);
    },
    onBlur,
  };
}

export type TemporalFieldApi<V> = ReturnType<typeof useTemporalField<V>>;
