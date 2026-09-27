import { useRef, type FocusEvent, type KeyboardEvent, type MouseEvent } from 'react';

// Anything a user operates on its own. A click or key press that starts on one of these inside a
// pressable surface belongs to that control; without this check a row's own action runs as well.
const NESTED_CONTROL = [
  'a[href]',
  'button',
  'input',
  'select',
  'textarea',
  'summary',
  'label',
  '[contenteditable]:not([contenteditable="false"])',
  '[role="button"]',
  '[role="link"]',
  '[role="checkbox"]',
  '[role="radio"]',
  '[role="switch"]',
  '[role="menuitem"]',
  '[role="option"]',
  '[role="tab"]',
  '[role="slider"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function isFromNestedControl(event: { target: EventTarget; currentTarget: EventTarget }) {
  const surface = event.currentTarget as Element;
  const target = event.target as Node;
  const start = target instanceof Element ? target : target.parentElement;
  const control = start?.closest(NESTED_CONTROL);
  return control != null && control !== surface && surface.contains(control);
}

export type UsePressableOptions<E extends HTMLElement> = {
  enabled: boolean;
  disabled?: boolean;
  onClick?: (event: MouseEvent<E>) => void;
  onKeyDown?: (event: KeyboardEvent<E>) => void;
  onKeyUp?: (event: KeyboardEvent<E>) => void;
  onBlur?: (event: FocusEvent<E>) => void;
};

// A card or a list row is a div, because a <button> may not hold headings, blocks or other
// controls. The div then has to do what the browser does for a button: Enter activates on key
// down and repeats, Space activates on key up and not at all if focus left in between.
export function usePressable<E extends HTMLElement>({
  enabled,
  disabled = false,
  onClick,
  onKeyDown,
  onKeyUp,
  onBlur,
}: UsePressableOptions<E>) {
  const spaceDown = useRef(false);

  if (!enabled) return { onClick, onKeyDown, onKeyUp, onBlur };

  return {
    role: 'button' as const,
    tabIndex: disabled ? undefined : 0,
    'aria-disabled': disabled ? true : undefined,
    onClick(event: MouseEvent<E>) {
      if (disabled || isFromNestedControl(event)) return;
      onClick?.(event);
    },
    onKeyDown(event: KeyboardEvent<E>) {
      onKeyDown?.(event);
      if (event.defaultPrevented || disabled || event.target !== event.currentTarget) return;
      if (event.key === 'Enter') {
        event.preventDefault();
        event.currentTarget.click();
      } else if (event.key === ' ') {
        // Stops the page from scrolling; the click itself waits for the key to come up.
        event.preventDefault();
        if (!event.repeat) spaceDown.current = true;
      }
    },
    onKeyUp(event: KeyboardEvent<E>) {
      onKeyUp?.(event);
      if (event.key !== ' ' || !spaceDown.current) return;
      spaceDown.current = false;
      if (!event.defaultPrevented && !disabled && event.target === event.currentTarget)
        event.currentTarget.click();
    },
    onBlur(event: FocusEvent<E>) {
      spaceDown.current = false;
      onBlur?.(event);
    },
  };
}
