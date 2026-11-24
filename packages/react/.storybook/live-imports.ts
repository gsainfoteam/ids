import * as Solid16 from '@heroicons/react/16/solid';
import * as InternationalizedDate from '@internationalized/date';
import * as Solid20 from '@heroicons/react/20/solid';
import * as Outline24 from '@heroicons/react/24/outline';
import * as Solid24 from '@heroicons/react/24/solid';
import * as React from 'react';
import * as Recharts from 'recharts';

import * as Ids from '../src';
import * as ChartEntry from '../src/chart';
import * as EditorEntry from '../src/editor';
import * as EnglishLocale from '../src/locales/en';
import * as KoreanLocale from '../src/locales/ko';
import * as RichTextEntry from '../src/rich-text';

export const heroiconSets = {
  '@heroicons/react/16/solid': Solid16,
  '@heroicons/react/20/solid': Solid20,
  '@heroicons/react/24/outline': Outline24,
  '@heroicons/react/24/solid': Solid24,
};

export const idsEntries = {
  '@gsainfoteam/ids-react': Ids,
  '@gsainfoteam/ids-react/chart': ChartEntry,
  '@gsainfoteam/ids-react/editor': EditorEntry,
  '@gsainfoteam/ids-react/rich-text': RichTextEntry,
  '@gsainfoteam/ids-react/locales/ko': KoreanLocale,
  '@gsainfoteam/ids-react/locales/en': EnglishLocale,
};

export const liveImports: Record<string, Record<string, unknown>> = {
  ...idsEntries,
  recharts: Recharts,
  '@internationalized/date': InternationalizedDate,
  ...heroiconSets,
};

type Source = {
  module: string;
  exports: Record<string, unknown>;
  takes: (name: string) => boolean;
};

const isPascalCase = (name: string) => /^[A-Z]/.test(name);
const anyName = () => true;

const everyExportOf = (modules: Record<string, Record<string, unknown>>): Source[] =>
  Object.entries(modules).map(([module, exports]) => ({ module, exports, takes: anyName }));

const WHERE_A_NAME_COMES_FROM: Source[] = [
  ...everyExportOf(idsEntries),
  ...everyExportOf({ react: React }),
  ...everyExportOf(heroiconSets),
  { module: 'recharts', exports: Recharts, takes: isPascalCase },
  { module: '@internationalized/date', exports: InternationalizedDate, takes: isPascalCase },
];

const JAVASCRIPT_GLOBALS = [
  'undefined',
  'NaN',
  'Infinity',
  'globalThis',
  'Object',
  'Function',
  'Array',
  'String',
  'Number',
  'Boolean',
  'Symbol',
  'BigInt',
  'Math',
  'Date',
  'RegExp',
  'JSON',
  'Intl',
  'Promise',
  'Map',
  'Set',
  'WeakMap',
  'WeakSet',
  'Error',
  'TypeError',
  'RangeError',
  'parseInt',
  'parseFloat',
  'isNaN',
  'isFinite',
  'encodeURIComponent',
  'decodeURIComponent',
  'structuredClone',
  'queueMicrotask',
];

const BROWSER_GLOBALS = [
  'window',
  'document',
  'navigator',
  'location',
  'console',
  'fetch',
  'setTimeout',
  'clearTimeout',
  'setInterval',
  'clearInterval',
  'requestAnimationFrame',
  'cancelAnimationFrame',
  'URL',
  'URLSearchParams',
  'File',
  'Blob',
  'FormData',
  'AbortController',
  'alert',
];

const GLOBALS_A_MODULE_READS = new Set([...JAVASCRIPT_GLOBALS, ...BROWSER_GLOBALS]);

export function resolveLiveImport(name: string) {
  const source = WHERE_A_NAME_COMES_FROM.find(
    ({ exports, takes }) => takes(name) && name in exports,
  );
  if (source) return source.module;
  if (GLOBALS_A_MODULE_READS.has(name)) return null;
  return undefined;
}
