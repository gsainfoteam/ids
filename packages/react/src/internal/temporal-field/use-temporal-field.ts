import {
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
} from 'react';

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
  display: (value: V) => string;
  // Reads typed text into a value, or undefined when the text is not an allowed value.
  parse?: (text: string) => V | undefined;
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
  // The control that owns the field's focus and label: the trigger button, or the text input
  // when the field takes typed dates.
  const triggerRef = useRef<HTMLButtonElement | HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  // What the user is typing, until it is read on Enter or blur. null shows the value itself.
  const [draft, setDraft] = useState<string | null>(null);
  const [unreadable, setUnreadable] = useState(false);

  const commit = (next: V) => {
    if (isSame(next, value)) return;
    if (!controlled) setInner(next);
    options.onValueChange?.(next);
  };
  const dropDraft = () => {
    setDraft(null);
    setUnreadable(false);
  };
  // An empty box clears the value; text that does not read as an allowed value stays as typed
  // and marks the field invalid rather than being thrown away.
  const readDraft = () => {
    if (draft === null || !options.parse) return true;
    const typed = draft.trim();
    const next = typed ? options.parse(typed) : empty;
    if (next === undefined) {
      setUnreadable(true);
      return false;
    }
    commit(next);
    dropDraft();
    return true;
  };

  const close = (restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus({ preventScroll: true });
  };

  const change: TemporalChange<V> = (next, { close: shouldClose = false } = {}) => {
    if (blocked) return;
    commit(next);
    dropDraft();
    if (shouldClose) close(true);
  };

  const clear = () => {
    if (blocked) return;
    commit(empty);
    dropDraft();
    close(true);
  };

  useFormReset(triggerRef, () => {
    if (!controlled) setInner(options.defaultValue);
    dropDraft();
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

  const input = {
    value: draft ?? (isEmpty(value) ? '' : options.display(value)),
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      const text = event.currentTarget.value;
      setUnreadable(false);
      // Paste, drop and autofill hand over a whole date at once, so it is read right away; a
      // date typed key by key waits for Enter or blur, since 2026-09-1 already reads as a date.
      const kind = (event.nativeEvent as InputEvent).inputType;
      const whole =
        kind === 'insertFromPaste' ||
        kind === 'insertFromDrop' ||
        kind === 'insertReplacementText' ||
        kind === undefined;
      const parsed = whole && text.trim() ? options.parse?.(text.trim()) : undefined;
      if (parsed === undefined) setDraft(text);
      else {
        commit(parsed);
        dropDraft();
      }
    },
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
      // The Enter that confirms an IME syllable is not the user's Enter.
      if (event.defaultPrevented || event.nativeEvent.isComposing) return;
      // Enter reads the text; unreadable text also stops the form's implicit submit.
      if (event.key === 'Enter' && !readDraft()) event.preventDefault();
      else if (event.key === 'ArrowDown' && !blocked) {
        event.preventDefault();
        readDraft();
        setOpen(true);
      } else if (event.key === 'Escape' && draft !== null && !expanded) {
        event.preventDefault();
        dropDraft();
      }
    },
    onBlur: (event: FocusEvent<HTMLInputElement>) => {
      readDraft();
      onBlur(event);
    },
  };

  const state: TemporalFieldState<V> = {
    value,
    open: expanded,
    empty: isEmpty(value),
    disabled,
    readOnly,
    invalid: options.invalid ?? unreadable,
    required,
  };

  return {
    state,
    input,
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
