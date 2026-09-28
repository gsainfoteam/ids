import { isValidElement, type ReactNode } from 'react';

import { difference, intersection } from 'es-toolkit';

import { flattenFragments } from '../../../utils';

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

export function textOf(children: unknown): string {
  if (typeof children === 'string' || typeof children === 'number') return String(children);
  if (typeof children === 'function' || children == null || typeof children === 'boolean')
    return '';
  return flattenFragments(children as ReactNode)
    .map((child) =>
      typeof child === 'string' || typeof child === 'number'
        ? String(child)
        : isValidElement<{ children?: unknown }>(child)
          ? textOf(child.props.children)
          : '',
    )
    .join('');
}

export function slotChildren(children: unknown, asChild?: boolean): ReactNode {
  return asChild && isValidElement<{ children?: ReactNode }>(children)
    ? children.props.children
    : (children as ReactNode);
}

export function collectOptions(children: ReactNode, kinds: OptionKinds): SelectOption[] {
  return flattenFragments(children).flatMap((child) => {
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

const COMBINING_ACCENTS = /[\u0300-\u036f]/g;

export function normalizeText(text: string) {
  return text.normalize('NFD').replace(COMBINING_ACCENTS, '').normalize('NFKC').toLocaleLowerCase();
}

export function matchesQuery(option: SelectOption, query: string) {
  const needle = normalizeText(query.trim());
  return !needle || normalizeText(option.search).includes(needle);
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
