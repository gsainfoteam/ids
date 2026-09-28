import { useRef, type FocusEvent, type KeyboardEvent, type MouseEvent } from 'react';

import { keyHandler, withModifiers } from './keys';

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
      if (disabled || event.target !== event.currentTarget) return;

      const surface = event.currentTarget;

      keyHandler(
        withModifiers({
          Enter: () => {
            surface.click();
          },
          Space: () => {
            if (!event.repeat) spaceDown.current = true;
          },
        }),
      )(event);
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
