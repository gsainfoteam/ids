import { uniqBy } from 'es-toolkit';

import { normalizeText } from '../../../internal/search-text';

import type { SelectOption } from '../select/select-options';

export type ChipValidateResult = boolean | string | null | undefined;

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

const textKey = (text: string) => normalizeText(text.trim());

export function sameText(a: string, b: string) {
  return textKey(a) === textKey(b);
}

export function findOption(options: SelectOption[], text: string) {
  return options.find((option) => sameText(option.label, text) || sameText(option.value, text));
}

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
  const leftToFix: string[] = [];
  const entries = uniqBy(
    tokens.map((token) => {
      const option = findOption(options, token);
      return { token, option, value: option?.value ?? token };
    }),
    (entry) => textKey(entry.value),
  ).filter((entry) => !selected.some((value) => sameText(value, entry.value)));
  for (const { token, option } of entries) {
    if (add.length >= room) leftToFix.push(token);
    else if (option && !option.disabled) add.push(option.value);
    else if (!option && creatable && !validationError(validate?.(token), 'invalid')) {
      add.push(token);
      created.push(token);
    } else leftToFix.push(token);
  }
  return { add, created, leftToFix };
}
