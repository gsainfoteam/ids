import bash from 'refractor/bash';
import { refractor, type Syntax } from 'refractor/core';
import css from 'refractor/css';
import diff from 'refractor/diff';
import javascript from 'refractor/javascript';
import json from 'refractor/json';
import jsx from 'refractor/jsx';
import markdown from 'refractor/markdown';
import markup from 'refractor/markup';
import python from 'refractor/python';
import sql from 'refractor/sql';
import tsx from 'refractor/tsx';
import typescript from 'refractor/typescript';
import yaml from 'refractor/yaml';

export type CodeBlockToken =
  | 'comment'
  | 'keyword'
  | 'string'
  | 'number'
  | 'function'
  | 'property'
  | 'tag'
  | 'punctuation'
  | 'inserted'
  | 'deleted';

export type CodeSegment = { text: string; token?: CodeBlockToken };
export type CodeLine = CodeSegment[];

type HighlightedTree = ReturnType<typeof refractor.highlight>;
type HighlightedNode = HighlightedTree['children'][number];

const BUILT_IN: Syntax[] = [
  bash,
  css,
  diff,
  javascript,
  json,
  jsx,
  markdown,
  markup,
  python,
  sql,
  tsx,
  typescript,
  yaml,
];

const BUILT_IN_NAMES: ReadonlySet<string> = new Set(
  BUILT_IN.flatMap((syntax) => [syntax.displayName, ...(syntax.aliases ?? [])]),
);

const PLAIN_TEXT: ReadonlySet<string> = new Set(['', 'text', 'plain', 'plaintext', 'txt']);

const TOKEN_OF_PRISM_TYPE: Readonly<Record<string, CodeBlockToken>> = {
  comment: 'comment',
  prolog: 'comment',
  doctype: 'comment',
  cdata: 'comment',
  keyword: 'keyword',
  atrule: 'keyword',
  rule: 'keyword',
  important: 'keyword',
  string: 'string',
  char: 'string',
  'attr-value': 'string',
  regex: 'string',
  url: 'string',
  number: 'number',
  boolean: 'number',
  constant: 'number',
  symbol: 'number',
  function: 'function',
  'class-name': 'function',
  builtin: 'function',
  property: 'property',
  'attr-name': 'property',
  variable: 'property',
  tag: 'tag',
  selector: 'tag',
  namespace: 'tag',
  punctuation: 'punctuation',
  operator: 'punctuation',
  inserted: 'inserted',
  deleted: 'deleted',
};

let builtInRegistered = false;

function registerBuiltIn() {
  if (builtInRegistered) return;
  BUILT_IN.forEach((syntax) => refractor.register(syntax));
  builtInRegistered = true;
}

export const languageKey = (language: string) => language.trim().toLowerCase();

export const isPlainText = (language: string) => PLAIN_TEXT.has(languageKey(language));

export const isBuiltIn = (language: string) => BUILT_IN_NAMES.has(languageKey(language));

function tokenOf(node: HighlightedNode): CodeBlockToken | undefined {
  if (node.type !== 'element') return undefined;
  const classes = node.properties.className;
  if (!Array.isArray(classes)) return undefined;
  for (const name of classes) {
    const token = TOKEN_OF_PRISM_TYPE[String(name)];
    if (token) return token;
  }
  return undefined;
}

function appendText(lines: CodeLine[], text: string, token: CodeBlockToken | undefined) {
  text.split('\n').forEach((piece, index) => {
    if (index > 0) lines.push([]);
    if (piece === '') return;
    const line = lines[lines.length - 1]!;
    const last = line[line.length - 1];
    if (last && last.token === token) last.text += piece;
    else line.push(token ? { text: piece, token } : { text: piece });
  });
}

function collectLines(
  nodes: HighlightedNode[],
  inherited: CodeBlockToken | undefined,
  lines: CodeLine[],
) {
  for (const node of nodes) {
    if (node.type === 'text') appendText(lines, node.value, inherited);
    else if (node.type === 'element')
      collectLines(node.children, tokenOf(node) ?? inherited, lines);
  }
}

export const plainLines = (code: string): CodeLine[] =>
  code.split('\n').map((text) => (text === '' ? [] : [{ text }]));

export function highlightLines(code: string, language: string, lazyLoaded: boolean): CodeLine[] {
  const key = languageKey(language);
  if (PLAIN_TEXT.has(key)) return plainLines(code);
  registerBuiltIn();
  const available = BUILT_IN_NAMES.has(key) || (lazyLoaded && refractor.registered(key));
  if (!available) return plainLines(code);

  const lines: CodeLine[] = [[]];
  collectLines(refractor.highlight(code, key).children, undefined, lines);
  return lines;
}

type LazyState = 'idle' | 'loading' | 'loaded';

let lazyState: LazyState = 'idle';
const lazyListeners = new Set<() => void>();

export function subscribeToLazyLanguages(listener: () => void) {
  lazyListeners.add(listener);
  return () => {
    lazyListeners.delete(listener);
  };
}

export const lazyLanguagesLoaded = () => lazyState === 'loaded';

export function loadLazyLanguages() {
  if (lazyState !== 'idle') return;
  lazyState = 'loading';
  import('./lazy-languages').then(
    ({ registerLazyLanguages }) => {
      registerBuiltIn();
      registerLazyLanguages();
      lazyState = 'loaded';
      lazyListeners.forEach((listener) => listener());
    },
    () => {
      lazyState = 'idle';
    },
  );
}
