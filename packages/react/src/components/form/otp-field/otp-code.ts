export type OTPFieldPattern = 'numeric' | 'alphanumeric' | RegExp;

export type Selection = { start: number; end: number };
export type SelectionHistory = Selection & { direction: 'forward' | 'backward' | 'none' };

const NUMERIC = '[0-9]';
const ALPHANUMERIC = '[A-Za-z0-9]';

// A RegExp pattern describes one character. Anchors and global flags would make .test() stateful
// or reject every single character, so the source is wrapped and g/y are dropped.
function characterSource(pattern: OTPFieldPattern) {
  if (pattern === 'numeric') return NUMERIC;
  if (pattern === 'alphanumeric') return ALPHANUMERIC;
  return `(?:${pattern.source})`;
}

function characterFlags(pattern: OTPFieldPattern) {
  return pattern instanceof RegExp ? pattern.flags.replace(/[gy]/g, '') : '';
}

export function createCharacterTest(pattern: OTPFieldPattern) {
  const expression = new RegExp(`^${characterSource(pattern)}$`, characterFlags(pattern));
  return (character: string) => expression.test(character);
}

// The value only ever holds accepted characters, so native validation only has to check the
// length: a half-filled code then fails the form's own validity check. Checking characters here
// as well would need regex flags, which the pattern attribute cannot carry.
export function htmlPattern(length: number) {
  return `.{${length}}`;
}

// NFKC folds full-width digits and letters that some keyboards and SMS apps produce.
export function sanitize(raw: string, accepts: (character: string) => boolean) {
  return Array.from(raw.normalize('NFKC')).filter(accepts).join('');
}

// Text inserted over a selection replaces the selection and then overwrites as many following
// characters as it is long, so pasting "34" onto the third slot of "12xx56" keeps "56".
export function insertText(value: string, { start, end }: Selection, text: string, length: number) {
  if (Array.from(text).length >= length) return Array.from(text).slice(0, length).join('');
  const chars = Array.from(value);
  const inserted = Array.from(text);
  const tail = chars.slice(Math.max(end, start + inserted.length));
  return [...chars.slice(0, start), ...inserted, ...tail].slice(0, length).join('');
}

// Mirrors the browser caret onto the slots. A collapsed caret over an existing character is
// widened to select that character, so typing overwrites it instead of shifting the code right.
// Moving left from a one-character selection must land on the previous character rather than
// re-select the same one, which is what the previous selection is kept for.
export function normalizeSelection(
  valueLength: number,
  maxLength: number,
  current: SelectionHistory,
  previous: SelectionHistory | null,
): SelectionHistory {
  const { start, end } = current;
  const collapsed = start === end;
  const inserting = start === valueLength && valueLength < maxLength;
  if (valueLength === 0 || !collapsed || inserting) return current;

  if (start === 0) return { start: 0, end: 1, direction: 'forward' };
  if (start === maxLength) return { start: start - 1, end: start, direction: 'backward' };

  let offset = 0;
  let direction: SelectionHistory['direction'] = 'forward';
  if (previous) {
    direction = start < previous.end ? 'backward' : 'forward';
    const wasInserting = previous.start === previous.end && previous.start < maxLength;
    if (direction === 'backward' && !wasInserting) offset = -1;
  }
  const from = Math.max(0, Math.min(start + offset, valueLength - 1));
  return { start: from, end: from + 1, direction };
}
