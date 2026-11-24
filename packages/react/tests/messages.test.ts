import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { expect, test } from 'vitest';

import { editorMessages } from '../src/components/form/editor/messages-catalog';
import { defineIdsLocale } from '../src/internal/locale';
import { messageArguments } from '../src/internal/message-arguments';
import { formatDefaultMessage, formatLocaleMessage, messages } from '../src/internal/messages';
import { en } from '../src/locales/en';
import { ko } from '../src/locales/ko';

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
const GENERATED = ['internal/messages.ts', 'messages-catalog.ts', 'message-arguments.ts'];
const isComponentCode = (file: string) =>
  /\.tsx?$/.test(file) &&
  !/\.stories\.tsx?$/.test(file) &&
  !file.startsWith('locales/') &&
  !GENERATED.some((generated) => file.endsWith(generated));

const koreanCatalog = ko.messages as Catalog;
const englishCatalog = en.messages as Catalog;
const korean = Object.fromEntries(leaves(koreanCatalog));
const english = Object.fromEntries(leaves(englishCatalog));
const keys = Object.keys(korean);
const ARGUMENT = /\{(\w+)\}/g;
const argumentsOf = (message: string) => new Set([...message.matchAll(ARGUMENT)].map(([, n]) => n));

test('the ko locale is the defaults the code falls back to', () => {
  expect(sortedDeep(koreanCatalog)).toEqual(sortedDeep({ ...messages, ...editorMessages }));
  expect(ko).toMatchObject({ language: 'ko', tag: 'ko-KR' });
  expect(en).toMatchObject({ language: 'en', tag: 'en-US' });
});

test('the en locale has exactly the leaf paths of the code', () => {
  expect(Object.keys(english).sort()).toEqual([...keys].sort());
});

test('both locales are sorted by group and key', () => {
  for (const tree of [koreanCatalog, englishCatalog])
    expect(JSON.stringify(tree)).toBe(JSON.stringify(sortedDeep(tree)));
});

test('messages take plain arguments only, the same in every locale and in their types', () => {
  for (const key of keys) {
    for (const message of [korean[key], english[key]])
      expect(message.replace(ARGUMENT, ''), key).not.toMatch(/[{}]/);
    expect(argumentsOf(english[key]), key).toEqual(argumentsOf(korean[key]));
    const declared = (messageArguments as Record<string, Record<string, string>>)[key] ?? {};
    expect(argumentsOf(korean[key]), key).toEqual(new Set(Object.keys(declared)));
  }

  expect(formatDefaultMessage('rating.valueLabel', { value: 1200, max: 2000 })).toBe(
    '2,000점 만점에 1,200점',
  );
  expect(formatDefaultMessage('common.removeItem', { label: '사과' })).toBe('사과 삭제');
});

test('a locale formats numbers with its tag and calls message functions with the values', () => {
  expect(formatLocaleMessage(en, 'rating.valueLabel', { value: 1200, max: 2000 })).toBe(
    '1,200 out of 2,000',
  );
  expect(formatLocaleMessage(en, 'avatarGroup.overflow', { count: 1200 }, 'de-DE')).toBe(
    '1.200 more',
  );

  const counted = defineIdsLocale({
    language: 'en',
    tag: 'en-US',
    messages: {
      avatarGroup: { overflow: ({ count }) => (count === 1 ? 'one more' : `${count} more`) },
    },
    base: en,
  });
  expect(formatLocaleMessage(counted, 'avatarGroup.overflow', { count: 1 })).toBe('one more');
  expect(formatLocaleMessage(counted, 'common.close')).toBe(en.messages.common.close);
});

test('every key is used by the code', () => {
  const source = readdirSync(SRC, { recursive: true, encoding: 'utf8' })
    .filter(isComponentCode)
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
    .filter(isComponentCode)
    .filter((file) => KOREAN_STRING.test(readFileSync(SRC + file, 'utf8')));

  expect(withKorean).toEqual([]);
});
