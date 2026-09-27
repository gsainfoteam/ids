import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type Ref,
  type RefCallback,
  type ClipboardEvent,
  type CompositionEvent,
  type FocusEvent,
  type PointerEvent,
} from 'react';

import {
  createCharacterTest,
  insertText,
  normalizeSelection,
  sanitize,
  type OTPFieldPattern,
  type SelectionHistory,
} from './otp-code';
import { useFormReset } from '../../../hooks/use-form-reset';
import { mergeRefs } from '../../../utils';

export type OTPSlotState = {
  index: number;
  char: string | undefined;
  isActive: boolean;
  isFilled: boolean;
  hasFakeCaret: boolean;
};

export type UseOTPFieldOptions = {
  length: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  pattern: OTPFieldPattern;
  disabled?: boolean;
  readOnly?: boolean;
  ref?: Ref<HTMLInputElement>;
};

// execCommand is the only way to change an input's value that stays on the browser's own undo
// stack. It returns false where it is missing (jsdom, some embedded engines), and the caller then
// writes the value itself.
function insertNatively(input: HTMLInputElement, start: number, end: number, text: string) {
  input.setSelectionRange(start, end);
  return (
    typeof document.execCommand === 'function' && document.execCommand('insertText', false, text)
  );
}

export function useOTPField({
  length,
  value,
  defaultValue = '',
  onValueChange,
  onComplete,
  pattern,
  disabled,
  readOnly,
  ref,
}: UseOTPFieldOptions) {
  const accepts = useMemo(() => createCharacterTest(pattern), [pattern]);
  const clean = (raw: string) => sanitize(raw, accepts);

  const [inner, setInner] = useState(() =>
    Array.from(clean(defaultValue)).slice(0, length).join(''),
  );
  const controlled = value !== undefined;
  const code = Array.from(clean(controlled ? value : inner))
    .slice(0, length)
    .join('');

  // While an IME is composing, the input must show exactly what the IME wrote or composition
  // breaks. The draft is shown instead of the code until composition ends.
  const [draft, setDraft] = useState<string | null>(null);
  const composing = useRef(false);

  const [focused, setFocused] = useState(false);
  const [selection, setSelection] = useState<SelectionHistory | null>(null);
  const previousSelection = useRef<SelectionHistory | null>(null);
  const pendingCaret = useRef<number | null>(null);
  const pointerFocus = useRef(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const commit = (next: string) => {
    if (next === code) return;
    if (!controlled) setInner(next);
    onValueChange?.(next);
    if (next.length === length && code.length !== length) onComplete?.(next);
  };

  const syncSelection = () => {
    const input = inputRef.current;
    if (!input || document.activeElement !== input || composing.current) return;
    const current: SelectionHistory = {
      start: input.selectionStart ?? 0,
      end: input.selectionEnd ?? 0,
      direction: input.selectionDirection ?? 'none',
    };
    const next = normalizeSelection(input.value.length, length, current, previousSelection.current);
    if (next.start !== current.start || next.end !== current.end)
      input.setSelectionRange(next.start, next.end, next.direction);
    previousSelection.current = next;
    setSelection((prev) =>
      prev?.start === next.start && prev.end === next.end && prev.direction === next.direction
        ? prev
        : next,
    );
  };
  const syncRef = useRef(syncSelection);
  useLayoutEffect(() => {
    syncRef.current = syncSelection;
  });

  // Programmatic edits (the fallback paths below) move the caret to the end when React writes the
  // value, so the intended caret is restored once the new value is in the DOM.
  useLayoutEffect(() => {
    const input = inputRef.current;
    if (pendingCaret.current !== null && input && document.activeElement === input) {
      const caret = Math.min(pendingCaret.current, input.value.length);
      input.setSelectionRange(caret, caret);
    }
    pendingCaret.current = null;
    syncSelection();
  });

  useEffect(() => {
    if (!focused) return;
    const onSelectionChange = () => syncRef.current();
    document.addEventListener('selectionchange', onSelectionChange);
    return () => document.removeEventListener('selectionchange', onSelectionChange);
  }, [focused]);

  // Typed characters outside the pattern are rejected before they reach the DOM, which keeps the
  // caret where it was. Full-width characters are replaced by their NFKC form instead.
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    const onBeforeInput = (event: InputEvent) => {
      if (event.inputType !== 'insertText' || !event.data || event.isComposing) return;
      const accepted = sanitize(event.data, accepts);
      if (accepted === event.data) return;
      event.preventDefault();
      if (accepted)
        insertNatively(input, input.selectionStart ?? 0, input.selectionEnd ?? 0, accepted);
    };
    input.addEventListener('beforeinput', onBeforeInput);
    return () => input.removeEventListener('beforeinput', onBeforeInput);
  }, [accepts]);

  // react-hook-form's register(), and any other code holding the element, writes input.value
  // directly on reset or setValue. The instance setter is wrapped so such a write reaches state;
  // otherwise React would paint the stale code back on the next render. React writes through the
  // same setter, so the comparison waits until its commit is done and the code ref is current.
  const latestCode = useRef(code);
  const selfWrite = useRef(false);
  const adoptExternal = useRef((_raw: string) => {});
  useLayoutEffect(() => {
    latestCode.current = code;
    adoptExternal.current = (raw) => {
      if (composing.current) return;
      const next = Array.from(clean(raw)).slice(0, length).join('');
      if (next !== latestCode.current) commit(next);
    };
  });

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    const own = Object.getOwnPropertyDescriptor(input, 'value');
    const base = own ?? Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
    if (!base?.get || !base.set) return;
    const { get, set } = base;
    Object.defineProperty(input, 'value', {
      configurable: true,
      enumerable: base.enumerable,
      get() {
        return get.call(this);
      },
      set(next: string) {
        set.call(this, next);
        if (selfWrite.current) return;
        queueMicrotask(() => adoptExternal.current(get.call(input)));
      },
    });
    return () => {
      if (own) Object.defineProperty(input, 'value', own);
      else Reflect.deleteProperty(input, 'value');
    };
  }, []);

  useFormReset(inputRef, () => {
    if (!controlled) setInner(Array.from(clean(defaultValue)).slice(0, length).join(''));
    setDraft(null);
    previousSelection.current = null;
  });

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const raw = input.value;
    if (composing.current || (event.nativeEvent as InputEvent).isComposing) {
      setDraft(raw);
      return;
    }
    // Autofill can ignore maxLength and append a whole code to what was already typed, so a
    // complete code in the inserted data wins over the concatenation.
    const data = (event.nativeEvent as InputEvent).data;
    const incoming = data ? clean(data) : '';
    const next =
      incoming.length >= length
        ? incoming.slice(0, length)
        : Array.from(clean(raw)).slice(0, length).join('');
    if (next !== raw) {
      const caret = Math.min(input.selectionStart ?? next.length, next.length);
      selfWrite.current = true;
      input.value = next;
      selfWrite.current = false;
      input.setSelectionRange(caret, caret);
      pendingCaret.current = caret;
    }
    commit(next);
  };

  const onPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    if (disabled || readOnly) return;
    event.preventDefault();
    const text = clean(event.clipboardData.getData('text'));
    if (!text) return;
    const input = event.currentTarget;
    const current = input.value;
    const start = input.selectionStart ?? current.length;
    const end = input.selectionEnd ?? current.length;

    const full = Array.from(text).length >= length;
    const piece = full ? text.slice(0, length) : text.slice(0, Math.max(0, length - start));
    const from = full ? 0 : start;
    const to = full
      ? current.length
      : Math.min(Math.max(end, start + piece.length), current.length);
    if (insertNatively(input, from, to, piece)) return;

    const next = insertText(current, { start: from, end: to }, piece, length);
    pendingCaret.current = Math.min(from + piece.length, next.length);
    commit(next);
  };

  // A click lands on the transparent input, so the slot under the pointer is found by position.
  // Only a plain primary mouse click is taken over; touch keeps the native long-press menu, and
  // double-click or shift-click keep native selection.
  const onPointerDown = (event: PointerEvent<HTMLInputElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0 || event.shiftKey || event.detail > 1)
      return;
    const slots = rootRef.current?.querySelectorAll<HTMLElement>('[data-otp-slot]');
    if (!slots?.length || disabled) return;
    event.preventDefault();
    const hit = Array.from(slots).findIndex(
      (slot) => slot.getBoundingClientRect().right > event.clientX,
    );
    const index = Number(
      (slots[hit === -1 ? slots.length - 1 : hit] as HTMLElement).dataset.otpSlot,
    );
    const input = event.currentTarget;
    pointerFocus.current = true;
    input.focus({ preventScroll: true });
    const valueLength = input.value.length;
    const caret = Math.min(index, valueLength, length - 1);
    const over = caret < valueLength;
    previousSelection.current = null;
    input.setSelectionRange(caret, over ? caret + 1 : caret);
    syncSelection();
  };

  // Focus from the keyboard or a label goes to where the next character would be typed.
  const onFocus = (event: FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    if (pointerFocus.current) {
      pointerFocus.current = false;
      return;
    }
    const input = event.currentTarget;
    const valueLength = input.value.length;
    const start = Math.min(valueLength, length - 1);
    previousSelection.current = null;
    input.setSelectionRange(start, valueLength);
  };

  const onBlur = () => {
    setFocused(false);
    setSelection(null);
    previousSelection.current = null;
  };

  const onCompositionStart = () => {
    composing.current = true;
  };

  const onCompositionEnd = (event: CompositionEvent<HTMLInputElement>) => {
    composing.current = false;
    setDraft(null);
    const next = Array.from(clean(event.currentTarget.value)).slice(0, length).join('');
    pendingCaret.current = next.length;
    commit(next);
  };

  const display = draft ?? code;
  const chars = Array.from(display);
  const slots: OTPSlotState[] = Array.from({ length }, (_, index) => {
    const collapsed = selection !== null && selection.start === selection.end;
    const isActive =
      focused &&
      selection !== null &&
      (collapsed
        ? index === Math.min(selection.start, length - 1)
        : index >= selection.start && index < selection.end);
    const char = chars[index];
    return {
      index,
      char,
      isActive,
      isFilled: char !== undefined,
      hasFakeCaret: isActive && collapsed && char === undefined,
    };
  });

  const mergedInputRef: RefCallback<HTMLInputElement> = useCallback(
    (node: HTMLInputElement | null) => mergeRefs(inputRef, ref)(node),
    [ref],
  );

  return {
    state: { code, display, focused, slots },
    rootRef,
    inputRef: mergedInputRef,
    handlers: {
      onChange,
      onPaste,
      onPointerDown,
      onFocus,
      onBlur,
      onCompositionStart,
      onCompositionEnd,
    },
  };
}
