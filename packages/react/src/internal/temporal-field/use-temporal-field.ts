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
import { isNodeFromAnyWindow } from '../../utils';

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
  parse?: (text: string) => V | undefined;
  onBlur?: (event: FocusEvent<HTMLButtonElement>) => void;
};

export function useTemporalField<V>(options: UseTemporalFieldOptions<V>) {
  const { empty, isEmpty, isSame, disabled, readOnly, required } = options;
  const [value, setValue] = useControllableState<V>({
    value: options.value,
    defaultValue: options.defaultValue,
    onValueChange: options.onValueChange,
  });
  const [open, setOpen] = useControllableState({
    value: options.open,
    defaultValue: options.defaultOpen ?? false,
    onValueChange: options.onOpenChange,
  });
  const blocked = disabled || readOnly;
  const expanded = open && !blocked;
  const popupId = `ids-temporal-${useId()}`;
  const controlRef = useRef<HTMLButtonElement | HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState<string | null>(null);
  const [unreadable, setUnreadable] = useState(false);

  const commit = (next: V) => {
    if (!isSame(next, value)) setValue(next);
  };
  const dropDraft = () => {
    setDraft(null);
    setUnreadable(false);
  };
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
    if (restoreFocus) controlRef.current?.focus({ preventScroll: true });
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

  useFormReset(controlRef, () => {
    setValue(options.defaultValue, { silent: true });
    dropDraft();
    setOpen(false);
  });

  const withinFieldOrItsPopup = (target: EventTarget | null) =>
    isNodeFromAnyWindow(target) &&
    (!!rootRef.current?.contains(target) ||
      !!(target as Element).closest?.(`[data-temporal-owner="${popupId}"]`));
  const onBlur = (event: FocusEvent<HTMLElement>) => {
    if (!withinFieldOrItsPopup(event.relatedTarget))
      options.onBlur?.(event as unknown as FocusEvent<HTMLButtonElement>);
  };

  const input = {
    value: draft ?? (isEmpty(value) ? '' : options.display(value)),
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      const text = event.currentTarget.value;
      setUnreadable(false);
      const kind = (event.nativeEvent as InputEvent).inputType;
      const arrivedWhole =
        kind === 'insertFromPaste' ||
        kind === 'insertFromDrop' ||
        kind === 'insertReplacementText' ||
        kind === undefined;
      const parsed = arrivedWhole && text.trim() ? options.parse?.(text.trim()) : undefined;
      if (parsed === undefined) setDraft(text);
      else {
        commit(parsed);
        dropDraft();
      }
    },
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.defaultPrevented || event.nativeEvent.isComposing) return;
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
    controlRef,
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
