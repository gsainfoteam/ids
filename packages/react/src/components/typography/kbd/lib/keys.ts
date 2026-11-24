import {
  MODIFIER_ALIASES,
  PUNCTUATION_CODE_MAP,
  isModifierKey,
  parseHotkey,
  resolveModifier,
  type CanonicalModifier,
  type Hotkey,
  type ParsedHotkey,
} from '@tanstack/react-hotkeys';

import type { IdsMessageKey } from '../../../../internal/messages';

export type KbdPlatform = 'mac' | 'windows' | 'linux';
export type KbdKeys = Hotkey | CanonicalModifier | 'Mod';
export type KbdLabel = IdsMessageKey extends infer Key
  ? Key extends `kbd.${infer Label}`
    ? Label
    : never
  : never;
export type KbdLabels = Partial<Record<KbdLabel, string>>;

type Face = { glyph: string; label?: KbdLabel };
type Spec = Record<KbdPlatform, Face>;

const MODIFIERS_IN_MENU_ORDER: Record<KbdPlatform, readonly CanonicalModifier[]> = {
  mac: ['Control', 'Alt', 'Shift', 'Meta'],
  windows: ['Meta', 'Control', 'Alt', 'Shift'],
  linux: ['Meta', 'Control', 'Alt', 'Shift'],
};

const LETTER_OR_DIGIT_CODE = /^(?:Key|Digit)(.)$/;

const symbol = (glyph: string, label: KbdLabel): Face => ({ glyph, label });
const text = (glyph: string): Face => ({ glyph });

const onMacAndElsewhere = (mac: Face, elsewhere: Face): Spec => ({
  mac,
  windows: elsewhere,
  linux: elsewhere,
});

const everywhere = (face: Face) => onMacAndElsewhere(face, face);

const KEYS: Record<string, Spec> = {
  Meta: { mac: symbol('⌘', 'command'), windows: text('Win'), linux: text('Super') },
  Control: onMacAndElsewhere(symbol('⌃', 'control'), text('Ctrl')),
  Alt: onMacAndElsewhere(symbol('⌥', 'option'), text('Alt')),
  Shift: onMacAndElsewhere(symbol('⇧', 'shift'), text('Shift')),
  Enter: onMacAndElsewhere(symbol('↩', 'return'), text('Enter')),
  Backspace: onMacAndElsewhere(symbol('⌫', 'macDelete'), text('Backspace')),
  Delete: onMacAndElsewhere(symbol('⌦', 'forwardDelete'), text('Del')),
  Escape: everywhere(text('Esc')),
  CapsLock: everywhere(text('Caps Lock')),
  ArrowUp: everywhere(symbol('↑', 'up')),
  ArrowDown: everywhere(symbol('↓', 'down')),
  ArrowLeft: everywhere(symbol('←', 'left')),
  ArrowRight: everywhere(symbol('→', 'right')),
  PageUp: everywhere(text('PgUp')),
  PageDown: everywhere(text('PgDn')),
  Fn: everywhere(text('fn')),
};

const GLYPHS: Record<string, KbdLabel> = {
  '⌘': 'command',
  '⌃': 'control',
  '⌥': 'option',
  '⇧': 'shift',
  '↩': 'return',
  '⏎': 'return',
  '↵': 'return',
  '⌫': 'macDelete',
  '⌦': 'forwardDelete',
  '↑': 'up',
  '↓': 'down',
  '←': 'left',
  '→': 'right',
};

export type ResolvedKey = { id: string; glyph: string; label: KbdLabel | undefined };

function resolveKey(name: string, platform: KbdPlatform): ResolvedKey {
  const face = KEYS[name]?.[platform];
  return { id: name, glyph: face?.glyph ?? name, label: face?.label };
}

function keyNameOf(parsed: ParsedHotkey) {
  if (parsed.code === undefined) return parsed.key;

  return (
    LETTER_OR_DIGIT_CODE.exec(parsed.code)?.[1] ?? PUNCTUATION_CODE_MAP[parsed.code] ?? parsed.code
  );
}

function modifierNamed(key: string, platform: KbdPlatform) {
  const alias = isModifierKey(key) ? MODIFIER_ALIASES[key] : undefined;
  return alias === undefined ? undefined : resolveModifier(alias, platform);
}

export function orderedKeys(keys: KbdKeys, platform: KbdPlatform): ResolvedKey[] {
  const parsed = parseHotkey(keys, platform);
  const key = keyNameOf(parsed);
  const modifierHeldAlone = modifierNamed(key, platform);

  const modifiers = MODIFIERS_IN_MENU_ORDER[platform].filter(
    (modifier) => parsed.modifiers.includes(modifier) || modifier === modifierHeldAlone,
  );
  const names = modifierHeldAlone || key === '' ? modifiers : [...modifiers, key];

  return names.map((name) => resolveKey(name, platform));
}

export type GlyphSegment = { text: string; label: KbdLabel | undefined };

export function splitGlyphs(written: string): GlyphSegment[] {
  const segments: GlyphSegment[] = [];
  for (const character of Array.from(written)) {
    const label = GLYPHS[character];
    const last = segments.at(-1);
    if (label === undefined && last && last.label === undefined) last.text += character;
    else segments.push({ text: character, label });
  }
  return segments;
}
