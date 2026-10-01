export type OTPFieldPattern = 'numeric' | 'alphanumeric' | RegExp;

export type Selection = { start: number; end: number };
export type SelectionHistory = Selection & { direction: 'forward' | 'backward' | 'none' };

const NUMERIC = '[0-9]';
const ALPHANUMERIC = '[A-Za-z0-9]';
const STATEFUL_TEST_FLAGS = /[gy]/g;
const FOLD_FULL_WIDTH = 'NFKC';

function characterSource(pattern: OTPFieldPattern) {
  if (pattern === 'numeric') return NUMERIC;
  if (pattern === 'alphanumeric') return ALPHANUMERIC;
  return `(?:${pattern.source})`;
}

function characterFlags(pattern: OTPFieldPattern) {
  return pattern instanceof RegExp ? pattern.flags.replace(STATEFUL_TEST_FLAGS, '') : '';
}

export function createCharacterTest(pattern: OTPFieldPattern) {
  const expression = new RegExp(`^${characterSource(pattern)}$`, characterFlags(pattern));
  return (character: string) => expression.test(character);
}

export function lengthOnlyPattern(length: number) {
  return `.{${length}}`;
}

export function sanitize(raw: string, accepts: (character: string) => boolean) {
  return Array.from(raw.normalize(FOLD_FULL_WIDTH)).filter(accepts).join('');
}

export function overwriteText(
  value: string,
  { start, end }: Selection,
  text: string,
  length: number,
) {
  if (Array.from(text).length >= length) return Array.from(text).slice(0, length).join('');
  const chars = Array.from(value);
  const inserted = Array.from(text);
  const tail = chars.slice(Math.max(end, start + inserted.length));
  return [...chars.slice(0, start), ...inserted, ...tail].slice(0, length).join('');
}

export function selectCharacterUnderCaret(
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
    const movedLeftOffSelectedCharacter = direction === 'backward' && !wasInserting;
    if (movedLeftOffSelectedCharacter) offset = -1;
  }
  const from = Math.max(0, Math.min(start + offset, valueLength - 1));
  return { start: from, end: from + 1, direction };
}
