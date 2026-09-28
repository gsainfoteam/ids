import { useEffect, useLayoutEffect, useRef } from 'react';

import { detectPlatform, parseHotkey } from '@tanstack/react-hotkeys';

const SAFARI_COMPOSING_KEY_CODE = 229;
const LETTER = /^[A-Z]$/;
const DIGIT = /^[0-9]$/;

const EVENT_KEY: Record<string, string> = { Space: ' ' };

function pressedKey(key: string, event: KeyboardEvent) {
  if (LETTER.test(key)) return event.code === `Key${key}` || event.key.toUpperCase() === key;
  if (DIGIT.test(key)) return event.code === `Digit${key}` || event.key === key;

  return event.key === (EVENT_KEY[key] ?? key);
}

export function matchesHotkey(event: KeyboardEvent, hotkey: string) {
  const parsed = parseHotkey(hotkey, detectPlatform());

  if (parsed.key === undefined) return false;

  const sameModifiers =
    parsed.meta === event.metaKey &&
    parsed.ctrl === event.ctrlKey &&
    parsed.alt === event.altKey &&
    parsed.shift === event.shiftKey;

  return sameModifiers && pressedKey(parsed.key, event);
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
