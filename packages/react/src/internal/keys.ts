import type { KeyboardEvent as ReactKeyboardEvent } from 'react';

import {
  MODIFIER_ORDER,
  createMultiHotkeyHandler,
  type CanonicalModifier,
  type Hotkey,
  type Key,
} from '@tanstack/react-hotkeys';

export type KeyAction<E extends Element> = (event: ReactKeyboardEvent<E>) => boolean | void;

export type KeyMap<E extends Element> = Partial<Record<Hotkey, KeyAction<E>>>;

export type KeyHandlerOptions = {
  dir?: 'ltr' | 'rtl';
  evenIfPrevented?: boolean;
  evenWhileComposing?: boolean;
};

const SAFARI_COMPOSING_KEY_CODE = 229;
const HORIZONTAL_ARROW = /Arrow(Left|Right)$/;

export function isComposingKey(event: KeyboardEvent) {
  return event.isComposing || event.keyCode === SAFARI_COMPOSING_KEY_CODE;
}

export function keyWithModifiers(
  key: Key,
  modifiers: readonly CanonicalModifier[] = MODIFIER_ORDER,
): Hotkey[] {
  const held = MODIFIER_ORDER.filter((modifier) => modifiers.includes(modifier));
  const combinations = held.reduce<CanonicalModifier[][]>(
    (subsets, modifier) => [...subsets, ...subsets.map((subset) => [...subset, modifier])],
    [[]],
  );

  return combinations.map((combination) => [...combination, key].join('+') as Hotkey);
}

export function withModifiers<E extends Element>(
  map: Partial<Record<Key, KeyAction<E>>>,
  modifiers: readonly CanonicalModifier[] = MODIFIER_ORDER,
): KeyMap<E> {
  const expanded: KeyMap<E> = {};

  for (const [key, action] of Object.entries(map) as Array<[Key, KeyAction<E> | undefined]>)
    if (action) for (const hotkey of keyWithModifiers(key, modifiers)) expanded[hotkey] = action;

  return expanded;
}

const mirrored = (hotkey: string) =>
  hotkey.replace(HORIZONTAL_ARROW, (_, side) =>
    side === 'Left' ? 'ArrowRight' : 'ArrowLeft',
  ) as Hotkey;

export function keyHandler<E extends Element>(
  map: KeyMap<E>,
  { dir = 'ltr', evenIfPrevented = false, evenWhileComposing = false }: KeyHandlerOptions = {},
) {
  return (event: ReactKeyboardEvent<E>) => {
    if (event.defaultPrevented && !evenIfPrevented) return false;
    if (isComposingKey(event.nativeEvent) && !evenWhileComposing) return false;

    let acted = false;
    const actions: Partial<Record<Hotkey, () => void>> = {};

    for (const [hotkey, action] of Object.entries(map) as Array<[Hotkey, KeyAction<E> | undefined]>)
      if (action)
        actions[dir === 'rtl' ? mirrored(hotkey) : hotkey] = () => {
          acted = action(event) !== false;
        };

    createMultiHotkeyHandler(actions, { preventDefault: false, stopPropagation: false })(
      event.nativeEvent,
    );

    if (acted) event.preventDefault();
    return acted;
  };
}
