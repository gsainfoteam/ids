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

import type { messages } from '../../../internal/messages';

export type KbdPlatform = 'mac' | 'windows' | 'linux';
export type KbdKeys = Hotkey | CanonicalModifier | 'Mod';
export type KbdLabel = keyof typeof messages.kbd;
export type KbdLabels = Partial<Record<KbdLabel, string>>;

type Face = { glyph: string; label: KbdLabel };
type Spec = Record<KbdPlatform, Face>;

const MODIFIERS_IN_MENU_ORDER: Record<KbdPlatform, readonly CanonicalModifier[]> = {
  mac: ['Control', 'Alt', 'Shift', 'Meta'],
  windows: ['Meta', 'Control', 'Alt', 'Shift'],
  linux: ['Meta', 'Control', 'Alt', 'Shift'],
};

const LETTER_OR_DIGIT_CODE = /^(?:Key|Digit)(.)$/;

const onMacAndElsewhere = (mac: Face, elsewhere: Face): Spec => ({
  mac,
  windows: elsewhere,
  linux: elsewhere,
});

const everywhere = (glyph: string, label: KbdLabel) =>
  onMacAndElsewhere({ glyph, label }, { glyph, label });

const KEYS: Record<string, Spec> = {
  Meta: {
    mac: { glyph: '⌘', label: 'command' },
    windows: { glyph: 'Win', label: 'windows' },
    linux: { glyph: 'Super', label: 'super' },
  },
  Control: onMacAndElsewhere({ glyph: '⌃', label: 'control' }, { glyph: 'Ctrl', label: 'control' }),
  Alt: onMacAndElsewhere({ glyph: '⌥', label: 'option' }, { glyph: 'Alt', label: 'alt' }),
  Shift: onMacAndElsewhere({ glyph: '⇧', label: 'shift' }, { glyph: 'Shift', label: 'shift' }),
  Enter: onMacAndElsewhere({ glyph: '↩', label: 'return' }, { glyph: 'Enter', label: 'enter' }),
  Backspace: onMacAndElsewhere(
    { glyph: '⌫', label: 'macDelete' },
    { glyph: 'Backspace', label: 'backspace' },
  ),
  Delete: onMacAndElsewhere(
    { glyph: '⌦', label: 'forwardDelete' },
    { glyph: 'Del', label: 'delete' },
  ),
  Escape: everywhere('Esc', 'escape'),
  Tab: onMacAndElsewhere({ glyph: '⇥', label: 'tab' }, { glyph: 'Tab', label: 'tab' }),
  Space: everywhere('Space', 'space'),
  CapsLock: onMacAndElsewhere(
    { glyph: '⇪', label: 'capsLock' },
    { glyph: 'Caps Lock', label: 'capsLock' },
  ),
  ArrowUp: everywhere('↑', 'up'),
  ArrowDown: everywhere('↓', 'down'),
  ArrowLeft: everywhere('←', 'left'),
  ArrowRight: everywhere('→', 'right'),
  PageUp: onMacAndElsewhere({ glyph: '⇞', label: 'pageUp' }, { glyph: 'PgUp', label: 'pageUp' }),
  PageDown: onMacAndElsewhere(
    { glyph: '⇟', label: 'pageDown' },
    { glyph: 'PgDn', label: 'pageDown' },
  ),
  Home: onMacAndElsewhere({ glyph: '↖', label: 'home' }, { glyph: 'Home', label: 'home' }),
  End: onMacAndElsewhere({ glyph: '↘', label: 'end' }, { glyph: 'End', label: 'end' }),
  Fn: everywhere('fn', 'fn'),
};

type GlyphLabel = KbdLabel | { mac: KbdLabel; elsewhere: KbdLabel };

const GLYPHS: Record<string, GlyphLabel> = {
  '⌘': 'command',
  '⌃': 'control',
  '⌥': 'option',
  '⇧': 'shift',
  '↩': 'return',
  '⏎': 'return',
  '↵': 'enter',
  '⌫': { mac: 'macDelete', elsewhere: 'backspace' },
  '⌦': 'forwardDelete',
  '⎋': 'escape',
  '⇥': 'tab',
  '⇪': 'capsLock',
  '␣': 'space',
  '↑': 'up',
  '↓': 'down',
  '←': 'left',
  '→': 'right',
  '⇞': 'pageUp',
  '⇟': 'pageDown',
  '↖': 'home',
  '↘': 'end',
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

export function splitGlyphs(text: string, platform: KbdPlatform): GlyphSegment[] {
  const segments: GlyphSegment[] = [];
  for (const character of Array.from(text)) {
    const entry = GLYPHS[character];
    const label =
      typeof entry === 'object' ? (platform === 'mac' ? entry.mac : entry.elsewhere) : entry;
    const last = segments.at(-1);
    if (label === undefined && last && last.label === undefined) last.text += character;
    else segments.push({ text: character, label });
  }
  return segments;
}
