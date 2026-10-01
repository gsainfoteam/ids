import { isValidElement, type ReactNode } from 'react';

import { flattenFragments } from '../utils';

const COMBINING_ACCENTS = /[̀-ͯ]/g;

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

export function normalizeText(text: string) {
  return text.normalize('NFD').replace(COMBINING_ACCENTS, '').normalize('NFKC').toLocaleLowerCase();
}

export function matchesSearch(text: string, query: string) {
  const needle = normalizeText(query.trim());

  return !needle || normalizeText(text).includes(needle);
}
