import { isValidElement, type ReactNode } from 'react';

import { flattenParts } from '../../../internal/field-popup';

export type SelectOption = {
  value: string;
  // What the trigger shows and typeahead matches.
  label: string;
  // What the search field matches; the label unless the item gives extra keywords.
  search: string;
  disabled: boolean;
};

type ItemProps = {
  value: string;
  label?: string;
  searchValue?: string;
  disabled?: boolean;
  asChild?: boolean;
  children?: unknown;
};

// The component types are passed in because this file cannot import the view that defines them.
export type OptionKinds = { item: unknown; group: unknown; content: unknown };

export function textOf(children: unknown): string {
  if (typeof children === 'string' || typeof children === 'number') return String(children);
  if (typeof children === 'function' || children == null || typeof children === 'boolean')
    return '';
  return flattenParts(children as ReactNode)
    .map((child) =>
      typeof child === 'string' || typeof child === 'number'
        ? String(child)
        : isValidElement<{ children?: unknown }>(child)
          ? textOf(child.props.children)
          : '',
    )
    .join('');
}

// An `asChild` part's own children are the ones inside the element it renders into.
export function slotChildren(children: unknown, asChild?: boolean): ReactNode {
  return asChild && isValidElement<{ children?: ReactNode }>(children)
    ? children.props.children
    : (children as ReactNode);
}

export function collectOptions(children: ReactNode, kinds: OptionKinds): SelectOption[] {
  return flattenParts(children).flatMap((child) => {
    if (!isValidElement<ItemProps>(child)) return [];
    if (child.type === kinds.item) {
      const label = child.props.label ?? textOf(child.props.children).trim();
      return [
        {
          value: child.props.value,
          label,
          search: child.props.searchValue ?? label,
          disabled: child.props.disabled === true,
        },
      ];
    }
    if (child.type === kinds.group || child.type === kinds.content)
      return collectOptions(slotChildren(child.props.children, child.props.asChild), kinds);
    return [];
  });
}

// Case, width (full-width Latin from some keyboards) and accents are ignored, so "cote" finds
// "Côte d'Ivoire". Hangul is recomposed after the accents are stripped.
export function normalizeText(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .normalize('NFKC')
    .toLocaleLowerCase();
}

export function matchesQuery(option: SelectOption, query: string) {
  const needle = normalizeText(query.trim());
  return !needle || normalizeText(option.search).includes(needle);
}

// WAI-ARIA typeahead: a string typed quickly jumps to the first label starting with it, from the
// current option on. Repeating one character cycles through the labels starting with it instead,
// the way a native select does, so "aaa" walks the A's rather than looking for "aaa".
export function typeaheadIndex(labels: string[], buffer: string, current: number) {
  const needle = normalizeText(buffer);
  if (!needle || !labels.length) return -1;
  const chars = Array.from(needle);
  const repeated = chars.every((char) => char === chars[0]);
  const prefix = repeated ? chars[0] : needle;
  const start = repeated ? current + 1 : Math.max(current, 0);
  for (let step = 0; step < labels.length; step++) {
    const index = (start + step) % labels.length;
    if (normalizeText(labels[index]).startsWith(prefix)) return index;
  }
  return -1;
}

// Keeps the list's order rather than the order of clicks, the way a native multiple select
// submits. Values that are not options (yet) stay at the end.
export function orderByOptions(values: string[], options: SelectOption[]) {
  const wanted = new Set(values);
  const known = options.filter((option) => wanted.has(option.value)).map((option) => option.value);
  const knownSet = new Set(known);
  return [...known, ...values.filter((value) => !knownSet.has(value))];
}
