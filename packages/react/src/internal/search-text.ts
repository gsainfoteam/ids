import { isValidElement, type ReactNode } from 'react';

import { uniq } from 'es-toolkit';

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

export type SearchChunk = { text: string; match: boolean };

type Range = { start: number; end: number };

const graphemeSegmenter =
  typeof Intl !== 'undefined' && 'Segmenter' in Intl
    ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    : null;

const graphemesOf = (text: string) =>
  graphemeSegmenter
    ? Array.from(graphemeSegmenter.segment(text), (part) => part.segment)
    : Array.from(text);

function foldWithOrigins(text: string) {
  let folded = '';
  const origins: Range[] = [];
  let offset = 0;

  for (const grapheme of graphemesOf(text)) {
    const origin = { start: offset, end: offset + grapheme.length };
    const piece = normalizeText(grapheme);

    folded += piece;
    for (let unit = 0; unit < piece.length; unit += 1) origins.push(origin);
    offset = origin.end;
  }

  return { folded, origins };
}

function mergeTouching(ranges: Range[]) {
  const merged: Range[] = [];

  for (const range of [...ranges].sort((a, b) => a.start - b.start)) {
    const last = merged.at(-1);
    if (last && range.start <= last.end) last.end = Math.max(last.end, range.end);
    else merged.push({ ...range });
  }

  return merged;
}

export function matchRanges(text: string, query: string | readonly string[]): Range[] {
  const needles = uniq(
    (typeof query === 'string' ? [query] : query)
      .map((part) => normalizeText(part.trim()))
      .filter(Boolean),
  );
  if (needles.length === 0 || text === '') return [];

  const { folded, origins } = foldWithOrigins(text);
  const found: Range[] = [];

  for (const needle of needles)
    for (let at = folded.indexOf(needle); at !== -1; at = folded.indexOf(needle, at + 1))
      found.push({ start: origins[at].start, end: origins[at + needle.length - 1].end });

  return mergeTouching(found);
}

export function searchChunks(text: string, query: string | readonly string[]): SearchChunk[] {
  const chunks: SearchChunk[] = [];
  let cursor = 0;

  for (const { start, end } of matchRanges(text, query)) {
    if (start > cursor) chunks.push({ text: text.slice(cursor, start), match: false });
    chunks.push({ text: text.slice(start, end), match: true });
    cursor = end;
  }
  if (cursor < text.length || chunks.length === 0)
    chunks.push({ text: text.slice(cursor), match: false });

  return chunks;
}
