import {
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type RefObject,
} from 'react';

import { clearInput } from './clear-input';
import { keyHandler, withModifiers } from '../keys';

type TextElement = HTMLInputElement | HTMLTextAreaElement;

const HANDLES_ITS_OWN_PRESS = 'button, a, input, textarea, select, label, [role=button]';

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

  const pressAnywhereFocusesInput = (event: MouseEvent<HTMLElement>) => {
    if (disabled || event.button !== 0) return;
    const target = event.target as Element;
    if (target.closest(HANDLES_ITS_OWN_PRESS)) return;
    event.preventDefault();
    inputRef.current?.focus();
  };

  const rootProps = {
    onFocus: () => setFocused(true),
    onBlur: (event: FocusEvent<HTMLElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
    },
    onMouseDown: pressAnywhereFocusesInput,
  };

  const onEscape = (event: KeyboardEvent<TextElement>) => {
    if (!clearable) return;

    const input = event.currentTarget;
    const escapeLeftForEnclosingPopup = input.value === '';

    keyHandler(
      withModifiers({
        Escape: () => {
          if (escapeLeftForEnclosingPopup || disabled || readOnly) return false;
          clearInput(input);
        },
      }),
    )(event);
  };

  return { focused, rootProps, clear, onEscape };
}
