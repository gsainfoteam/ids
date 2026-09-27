import { uniqBy } from 'es-toolkit';

import { normalizeText, type SelectOption } from '../select/select-options';

export type ChipValidateResult = boolean | string | null | undefined;

// Commas, tabs and line breaks separate chips, so a pasted CSV row or column becomes several.
const SEPARATOR = /[,\t\r\n]/;

export function hasSeparator(text: string) {
  return SEPARATOR.test(text);
}

export function splitTokens(text: string) {
  return text
    .split(SEPARATOR)
    .map((token) => token.trim())
    .filter(Boolean);
}

// Case, width and accents are ignored, so "react", "React" and "Ｒｅａｃｔ" are one chip.
const textKey = (text: string) => normalizeText(text.trim());

export function sameText(a: string, b: string) {
  return textKey(a) === textKey(b);
}

export function findOption(options: SelectOption[], text: string) {
  return options.find((option) => sameText(option.label, text) || sameText(option.value, text));
}

// `validate` returns true (or nothing) to accept, false to reject with the default message, or
// the message itself.
export function validationError(result: ChipValidateResult, fallback: string) {
  if (result === false) return fallback;
  if (typeof result === 'string' && result !== '') return result;
  return null;
}

type ResolveOptions = {
  tokens: string[];
  options: SelectOption[];
  selected: string[];
  creatable: boolean;
  validate?: (value: string) => ChipValidateResult;
  room: number;
};

// Turns typed or pasted tokens into values: an option by its label or value, otherwise a created
// value when that is allowed and valid. Duplicates are dropped, and whatever cannot be added
// (unknown, invalid, over the limit) is returned for the user to fix.
export function resolveTokens({
  tokens,
  options,
  selected,
  creatable,
  validate,
  room,
}: ResolveOptions) {
  const add: string[] = [];
  const created: string[] = [];
  const rest: string[] = [];
  const entries = uniqBy(
    tokens.map((token) => {
      const option = findOption(options, token);
      return { token, option, value: option?.value ?? token };
    }),
    (entry) => textKey(entry.value),
  ).filter((entry) => !selected.some((value) => sameText(value, entry.value)));
  for (const { token, option } of entries) {
    if (add.length >= room) rest.push(token);
    else if (option && !option.disabled) add.push(option.value);
    else if (!option && creatable && !validationError(validate?.(token), 'invalid')) {
      add.push(token);
      created.push(token);
    } else rest.push(token);
  }
  return { add, created, rest };
}
