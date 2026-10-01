import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { IntlMessageFormat } from 'intl-messageformat';
import { expect, test } from 'vitest';

import { formatDefaultMessage, messages } from '../src/internal/messages';

type Catalog = { [name: string]: string | Catalog };

const leaves = (catalog: Catalog, prefix = ''): [string, string][] =>
  Object.entries(catalog).flatMap(([name, value]) =>
    typeof value === 'string'
      ? [[`${prefix}${name}`, value] as [string, string]]
      : leaves(value, `${prefix}${name}.`),
  );

const sortedDeep = (catalog: Catalog): Catalog =>
  Object.fromEntries(
    Object.keys(catalog)
      .sort()
      .map((name) => {
        const value = catalog[name];
        return [name, typeof value === 'string' ? value : sortedDeep(value)];
      }),
  );

const PACKAGE = fileURLToPath(new URL('../', import.meta.url));
const SRC = `${PACKAGE}src/`;

const catalog = (file: string) =>
  JSON.parse(readFileSync(`${PACKAGE}dist/messages/${file}`, 'utf8')) as Catalog;

const koreanCatalog = catalog('ko.json');
const englishCatalog = catalog('en.json');
const korean = Object.fromEntries(leaves(koreanCatalog));
const english = Object.fromEntries(leaves(englishCatalog));
const keys = leaves(messages).map(([key]) => key);

const SIMPLE_ARGUMENT = 1;
const LITERAL = 0;

type Element = { type: number; value?: string; options?: Record<string, { value: Element[] }> };

const argumentNames = (elements: Element[]): string[] =>
  elements.flatMap((element) => [
    ...(element.type !== LITERAL && element.value !== undefined ? [element.value] : []),
    ...Object.values(element.options ?? {}).flatMap((option) => argumentNames(option.value)),
  ]);

const parse = (pattern: string, locale: string) =>
  new IntlMessageFormat(pattern, locale).getAst() as Element[];

test('ko.json is the defaults the code falls back to', () => {
  expect(koreanCatalog).toEqual(messages);
});

test('en.json has exactly the leaf paths of the code', () => {
  expect(Object.keys(english).sort()).toEqual([...keys].sort());
});

test('the defaults and both catalogs are sorted by group and key', () => {
  for (const tree of [messages, koreanCatalog, englishCatalog])
    expect(JSON.stringify(tree)).toBe(JSON.stringify(sortedDeep(tree)));
});

test('every string is an ICU message, and a translation takes the same arguments', () => {
  for (const key of keys) {
    const koreanArguments = argumentNames(parse(korean[key], 'ko-KR'));
    const englishArguments = argumentNames(parse(english[key], 'en-US'));
    expect(new Set(englishArguments), key).toEqual(new Set(koreanArguments));
  }
});

test('a Korean default uses only plain arguments, which formatDefaultMessage fills', () => {
  for (const key of keys)
    for (const element of parse(korean[key], 'ko-KR'))
      expect([LITERAL, SIMPLE_ARGUMENT], key).toContain(element.type);

  expect(formatDefaultMessage('textArea.countOfMax', { count: 1200, maxLength: 2000 })).toBe(
    '1,200 / 2,000',
  );
  expect(formatDefaultMessage('chipField.remove', { label: '사과' })).toBe('사과 삭제');
});

test('every key is used by the code', () => {
  const source = readdirSync(SRC, { recursive: true, encoding: 'utf8' })
    .filter((file) => /\.tsx?$/.test(file) && !/\.stories\.tsx?$/.test(file))
    .filter((file) => !file.endsWith('internal/messages.ts'))
    .map((file) => readFileSync(SRC + file, 'utf8'))
    .join('\n');

  const unused = keys.filter((key) => {
    const group = key.slice(0, key.lastIndexOf('.'));
    return !source.includes(`'${key}'`) && !source.includes(`\`${group}.\${`);
  });

  expect(unused).toEqual([]);
});

test('no Korean string is written into a component outside the defaults', () => {
  const KOREAN_STRING = /(['"`])[^'"`\n]*[ㄱ-힝][^'"`\n]*\1/;
  const withKorean = readdirSync(SRC, { recursive: true, encoding: 'utf8' })
    .filter((file) => /\.tsx?$/.test(file) && !/\.stories\.tsx?$/.test(file))
    .filter((file) => !file.endsWith('internal/messages.ts'))
    .filter((file) => KOREAN_STRING.test(readFileSync(SRC + file, 'utf8')));

  expect(withKorean).toEqual([]);
});
