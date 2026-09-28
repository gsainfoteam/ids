import { useEffect, useLayoutEffect, useRef } from 'react';

import { detectPlatform, parseKeys, resolveKey } from '../../typography/kbd/keys';

const MODIFIERS = ['meta', 'ctrl', 'alt', 'shift'] as const;
const SAFARI_COMPOSING_KEY_CODE = 229;
const LETTER = /^[A-Z]$/;
const DIGIT = /^[0-9]$/;

type Modifier = (typeof MODIFIERS)[number];

const EVENT_KEY: Record<string, string> = {
  enter: 'Enter',
  escape: 'Escape',
  tab: 'Tab',
  space: ' ',
  backspace: 'Backspace',
  delete: 'Delete',
  up: 'ArrowUp',
  down: 'ArrowDown',
  left: 'ArrowLeft',
  right: 'ArrowRight',
  pageup: 'PageUp',
  pagedown: 'PageDown',
  home: 'Home',
  end: 'End',
};

const isModifier = (id: string): id is Modifier => (MODIFIERS as readonly string[]).includes(id);

function pressedKey(key: string, event: KeyboardEvent) {
  if (LETTER.test(key)) return event.code === `Key${key}` || event.key.toUpperCase() === key;
  if (DIGIT.test(key)) return event.code === `Digit${key}` || event.key === key;

  return event.key === (EVENT_KEY[key] ?? key);
}

export function matchesHotkey(event: KeyboardEvent, hotkey: string) {
  const platform = detectPlatform();
  const ids = parseKeys(hotkey).map((token) => resolveKey(token, platform).id);
  const modifiers = ids.filter(isModifier);
  const keys = ids.filter((id) => !isModifier(id));

  if (keys.length !== 1) return false;

  const held: Record<Modifier, boolean> = {
    meta: event.metaKey,
    ctrl: event.ctrlKey,
    alt: event.altKey,
    shift: event.shiftKey,
  };
  const sameModifiers = MODIFIERS.every(
    (modifier) => held[modifier] === modifiers.includes(modifier),
  );

  return sameModifiers && pressedKey(keys[0]!, event);
}

export function useHotkey(hotkey: string | undefined, onPress: () => void) {
  const latest = useRef(onPress);

  useLayoutEffect(() => {
    latest.current = onPress;
  });

  useEffect(() => {
    if (!hotkey) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const composing = event.isComposing || event.keyCode === SAFARI_COMPOSING_KEY_CODE;
      if (event.defaultPrevented || event.repeat || composing) return;
      if (!matchesHotkey(event, hotkey)) return;

      event.preventDefault();
      latest.current();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [hotkey]);
}
