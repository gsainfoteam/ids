import type { messages } from '../../../internal/messages';

export type KbdPlatform = 'apple' | 'other';
export type KbdLabel = keyof typeof messages.kbd;
export type KbdLabels = Partial<Record<KbdLabel, string>>;

type Face = { glyph: string; label: KbdLabel };
type Spec = { apple: Face; other: Face; order?: Record<KbdPlatform, number> };

const same = (glyph: string, label: KbdLabel) => ({
  apple: { glyph, label },
  other: { glyph, label },
});

// Modifier order follows each platform's menus: ⌃⌥⇧⌘ on Apple, Win+Ctrl+Alt+Shift elsewhere.
const KEYS: Record<string, Spec> = {
  meta: {
    apple: { glyph: '⌘', label: 'command' },
    other: { glyph: 'Win', label: 'windows' },
    order: { apple: 3, other: 0 },
  },
  ctrl: {
    apple: { glyph: '⌃', label: 'control' },
    other: { glyph: 'Ctrl', label: 'control' },
    order: { apple: 0, other: 1 },
  },
  alt: {
    apple: { glyph: '⌥', label: 'option' },
    other: { glyph: 'Alt', label: 'alt' },
    order: { apple: 1, other: 2 },
  },
  shift: {
    apple: { glyph: '⇧', label: 'shift' },
    other: { glyph: 'Shift', label: 'shift' },
    order: { apple: 2, other: 3 },
  },
  enter: { apple: { glyph: '↩', label: 'return' }, other: { glyph: 'Enter', label: 'enter' } },
  backspace: {
    apple: { glyph: '⌫', label: 'macDelete' },
    other: { glyph: 'Backspace', label: 'backspace' },
  },
  delete: {
    apple: { glyph: '⌦', label: 'forwardDelete' },
    other: { glyph: 'Del', label: 'delete' },
  },
  escape: same('Esc', 'escape'),
  tab: { apple: { glyph: '⇥', label: 'tab' }, other: { glyph: 'Tab', label: 'tab' } },
  space: same('Space', 'space'),
  capslock: {
    apple: { glyph: '⇪', label: 'capsLock' },
    other: { glyph: 'Caps Lock', label: 'capsLock' },
  },
  up: same('↑', 'up'),
  down: same('↓', 'down'),
  left: same('←', 'left'),
  right: same('→', 'right'),
  pageup: { apple: { glyph: '⇞', label: 'pageUp' }, other: { glyph: 'PgUp', label: 'pageUp' } },
  pagedown: {
    apple: { glyph: '⇟', label: 'pageDown' },
    other: { glyph: 'PgDn', label: 'pageDown' },
  },
  home: { apple: { glyph: '↖', label: 'home' }, other: { glyph: 'Home', label: 'home' } },
  end: { apple: { glyph: '↘', label: 'end' }, other: { glyph: 'End', label: 'end' } },
  fn: same('fn', 'fn'),
};

const ALIASES: Record<string, string> = {
  cmd: 'meta',
  command: 'meta',
  super: 'meta',
  win: 'meta',
  windows: 'meta',
  os: 'meta',
  control: 'ctrl',
  option: 'alt',
  opt: 'alt',
  return: 'enter',
  esc: 'escape',
  del: 'delete',
  spacebar: 'space',
  arrowup: 'up',
  arrowdown: 'down',
  arrowleft: 'left',
  arrowright: 'right',
  pgup: 'pageup',
  pgdn: 'pagedown',
  caps: 'capslock',
  plus: '+',
};

// Written glyphs a reader would otherwise hear as "place of interest sign" or nothing at all.
const GLYPHS: Record<string, KbdLabel | Record<KbdPlatform, KbdLabel>> = {
  '⌘': 'command',
  '⌃': 'control',
  '⌥': 'option',
  '⇧': 'shift',
  '↩': 'return',
  '⏎': 'return',
  '↵': 'enter',
  '⌫': { apple: 'macDelete', other: 'backspace' },
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

// "mod+shift+k", tinykeys' "$mod+KeyK" and arrays all read the same. A '+' at the end of a
// string is the plus key itself, so "mod++" is mod and +.
export function parseKeys(keys: string | readonly string[]): string[] {
  const tokens = typeof keys === 'string' ? keys.split(/\+(?!$)/) : [...keys];
  return tokens.map(normalizeKey).filter((token) => token !== '');
}

function normalizeKey(raw: string) {
  const token = raw.trim().replace(/^\$/, '');
  if (token === '') return raw === ' ' ? 'space' : '';
  const code = /^(?:Key([A-Z])|Digit([0-9]))$/.exec(token);
  if (code) return code[1] ?? code[2] ?? token;
  const lower = token.toLowerCase();
  const name = ALIASES[lower] ?? lower;
  if (name === 'mod' || name in KEYS) return name;
  if (name === '+') return '+';
  return token.length === 1 ? token.toUpperCase() : token;
}

export type ResolvedKey = { id: string; glyph: string; label: KbdLabel | undefined };

// `mod` is the platform's command key: ⌘ on Apple devices, Ctrl everywhere else.
export function resolveKey(token: string, platform: KbdPlatform): ResolvedKey {
  const id = token === 'mod' ? (platform === 'apple' ? 'meta' : 'ctrl') : token;
  const spec = KEYS[id];
  if (!spec) return { id, glyph: id, label: undefined };
  return { id, glyph: spec[platform].glyph, label: spec[platform].label };
}

export function orderKeys(tokens: readonly string[], platform: KbdPlatform): ResolvedKey[] {
  const keys = tokens.map((token) => resolveKey(token, platform));
  const rank = (key: ResolvedKey) => KEYS[key.id]?.order?.[platform] ?? Infinity;
  return keys
    .map((key, index) => ({ key, index }))
    .sort((a, b) => rank(a.key) - rank(b.key) || a.index - b.index)
    .map(({ key }) => key);
}

export type GlyphSegment = { text: string; label: KbdLabel | undefined };

export function splitGlyphs(text: string, platform: KbdPlatform): GlyphSegment[] {
  const segments: GlyphSegment[] = [];
  for (const character of Array.from(text)) {
    const entry = GLYPHS[character];
    const label = typeof entry === 'object' ? entry[platform] : entry;
    const last = segments.at(-1);
    if (label === undefined && last && last.label === undefined) last.text += character;
    else segments.push({ text: character, label });
  }
  return segments;
}

const APPLE = /mac|iphone|ipad|ipod/i;

export function detectPlatform(): KbdPlatform {
  if (typeof navigator === 'undefined') return 'other';
  const hint = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData
    ?.platform;
  return APPLE.test(hint || navigator.platform || navigator.userAgent) ? 'apple' : 'other';
}
