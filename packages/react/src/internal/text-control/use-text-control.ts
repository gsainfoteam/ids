import {
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type RefObject,
} from 'react';

import { clearInput } from './clear-input';

type TextElement = HTMLInputElement | HTMLTextAreaElement;

export type UseTextControlOptions = {
  inputRef: RefObject<TextElement | null>;
  disabled: boolean;
  readOnly: boolean;
  clearable?: boolean;
};

export function useTextControl({ inputRef, disabled, readOnly, clearable }: UseTextControlOptions) {
  const [focused, setFocused] = useState(false);

  const clear = () => {
    const input = inputRef.current;
    if (input && !disabled && !readOnly) clearInput(input);
  };

  const rootProps = {
    onFocus: () => setFocused(true),
    onBlur: (event: FocusEvent<HTMLElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
    },
    onMouseDown: (event: MouseEvent<HTMLElement>) => {
      if (disabled || event.button !== 0) return;
      const target = event.target as Element;
      if (target.closest('button, a, input, textarea, select, label, [role=button]')) return;
      event.preventDefault();
      inputRef.current?.focus();
    },
  };

  const onEscape = (event: KeyboardEvent<TextElement>) => {
    if (
      !clearable ||
      event.key !== 'Escape' ||
      event.defaultPrevented ||
      event.nativeEvent.isComposing ||
      event.currentTarget.value === '' ||
      disabled ||
      readOnly
    )
      return;
    event.preventDefault();
    clearInput(event.currentTarget);
  };

  return { focused, rootProps, clear, onEscape };
}
