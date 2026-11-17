import { describe, expect, test } from 'vitest';

import { matchesSearch, matchRanges, searchChunks } from '../src/internal/search-text';

const marked = (text: string, query: string | readonly string[]) =>
  searchChunks(text, query)
    .map((chunk) => (chunk.match ? `[${chunk.text}]` : chunk.text))
    .join('');

describe('searchChunks', () => {
  test('marks every occurrence of one query', () => {
    expect(marked('셔틀 막차와 셔틀 첫차', '셔틀')).toBe('[셔틀] 막차와 [셔틀] 첫차');
  });

  test('marks every query of a list', () => {
    expect(marked('React and Flutter', ['react', 'flutter'])).toBe('[React] and [Flutter]');
  });

  test('merges overlapping and touching matches into one chunk', () => {
    expect(marked('광주송정역행', ['광주송정', '송정역'])).toBe('[광주송정역]행');
    expect(marked('reactflutter', ['react', 'flutter'])).toBe('[reactflutter]');
    expect(marked('aaaa', 'aa')).toBe('[aaaa]');
    expect(marked('React', ['react', 'act'])).toBe('[React]');
  });

  test('leaves the text alone for an empty, blank or missing query', () => {
    expect(searchChunks('셔틀', '')).toEqual([{ text: '셔틀', match: false }]);
    expect(searchChunks('셔틀', '   ')).toEqual([{ text: '셔틀', match: false }]);
    expect(searchChunks('셔틀', [])).toEqual([{ text: '셔틀', match: false }]);
    expect(searchChunks('셔틀', ['', ' '])).toEqual([{ text: '셔틀', match: false }]);
    expect(searchChunks('', '셔틀')).toEqual([{ text: '', match: false }]);
  });

  test('trims the query the way Select does', () => {
    expect(marked('셔틀 막차', ' 막차 ')).toBe('셔틀 [막차]');
  });

  test('reads regular expression characters as text', () => {
    expect(marked('(a+b)* = a* + b*', '(a+b)*')).toBe('[(a+b)*] = a* + b*');
    expect(marked('a.b axb', 'a.b')).toBe('[a.b] axb');
    expect(marked('[x] \\d $1 ^', ['[x]', '\\d', '$1', '^'])).toBe('[[x]] [\\d] [$1] [^]');
  });

  test('ignores case, full width and accents, and keeps the original text', () => {
    expect(marked('IDS Ids ids', 'ids')).toBe('[IDS] [Ids] [ids]');
    expect(marked('ＧＩＳＴ 셔틀', 'gist')).toBe('[ＧＩＳＴ] 셔틀');
    expect(marked('Café', 'cafe')).toBe('[Café]');
    expect(marked('Café au lait', 'café')).toBe('[Café] au lait');
    expect(marked('cafe', 'CAFÉ')).toBe('[cafe]');
  });

  test('never splits a grapheme', () => {
    expect(marked('éclair', 'e')).toBe('[é]clair');
    expect(marked('👩‍👩‍👧 가족', '가족')).toBe('👩‍👩‍👧 [가족]');
  });

  test('matches what matchesSearch accepts', () => {
    const cases: [string, string][] = [
      ['2학기 셔틀 시간표', '셔틀'],
      ['ＧＩＳＴ', 'gist'],
      ['Crème brûlée', 'creme brulee'],
      ['설', 'ㅅ'],
    ];

    for (const [text, query] of cases)
      expect(matchRanges(text, query).length > 0, `${text} / ${query}`).toBe(
        matchesSearch(text, query),
      );
  });

  test('joins back into the original text', () => {
    const text = 'Café ＧＩＳＴ, cafe gist, 카페';

    expect(
      searchChunks(text, ['cafe', 'gist'])
        .map((chunk) => chunk.text)
        .join(''),
    ).toBe(text);
  });
});
