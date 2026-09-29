import { isValidElement, type ReactNode } from 'react';

import { difference, intersection } from 'es-toolkit';

import { matchesSearch, normalizeText, textOf } from '../../../internal/search-text';
import { elementTypeOf, flattenFragments } from '../../../utils';

export type SelectOption = {
  value: string;
  label: string;
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

export type OptionKinds = { item: unknown; group: unknown; content: unknown };

export function slotChildren(children: unknown, asChild?: boolean): ReactNode {
  return asChild && isValidElement<{ children?: ReactNode }>(children)
    ? children.props.children
    : (children as ReactNode);
}

export function collectOptions(children: ReactNode, kinds: OptionKinds): SelectOption[] {
  return flattenFragments(children).flatMap((child) => {
    if (!isValidElement<ItemProps>(child)) return [];
    if (elementTypeOf(child) === kinds.item) {
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
    if (elementTypeOf(child) === kinds.group || elementTypeOf(child) === kinds.content)
      return collectOptions(slotChildren(child.props.children, child.props.asChild), kinds);
    return [];
  });
}

export function matchesQuery(option: SelectOption, query: string) {
  return matchesSearch(option.search, query);
}

export function typeaheadIndex(labels: string[], buffer: string, current: number) {
  const needle = normalizeText(buffer);
  if (!needle || !labels.length) return -1;
  const chars = Array.from(needle);
  const cyclesOneLetter = chars.every((char) => char === chars[0]);
  const prefix = cyclesOneLetter ? chars[0] : needle;
  const start = cyclesOneLetter ? current + 1 : Math.max(current, 0);
  for (let step = 0; step < labels.length; step++) {
    const index = (start + step) % labels.length;
    if (normalizeText(labels[index]).startsWith(prefix)) return index;
  }
  return -1;
}

export function orderByOptions(values: string[], options: SelectOption[]) {
  const listed = options.map((option) => option.value);
  return [...intersection(listed, values), ...difference(values, listed)];
}
