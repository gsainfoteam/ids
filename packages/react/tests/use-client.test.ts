import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { expect, test } from 'vitest';

const SRC = fileURLToPath(new URL('../src/', import.meta.url));
const DIST = fileURLToPath(new URL('../dist/', import.meta.url));

const CALLS_A_HOOK = /\buse(?:[A-Z]\w*)?\s*(?:<[^>]*>)?\s*\(/;
const CREATES_A_CONTEXT = /\bcreateContext\b/;
const USE_CLIENT = /^['"]use client['"];/;

const sourceModules = readdirSync(SRC, { recursive: true, encoding: 'utf8' })
  .filter((file) => /\.tsx?$/.test(file) && !/\.stories\.tsx?$/.test(file))
  .sort();

const isReexportOnly = (code: string) =>
  code
    .split('\n')
    .every(
      (line) =>
        line.trim() === '' || /^(import |export (type )?\{|export \* from |\}|\s)/.test(line),
    );

const runsOnTheClient = (file: string, code: string) =>
  CALLS_A_HOOK.test(code) ||
  CREATES_A_CONTEXT.test(code) ||
  (file.endsWith('.tsx') && !isReexportOnly(code));

const clientModules = sourceModules.filter((file) =>
  runsOnTheClient(file, readFileSync(SRC + file, 'utf8')),
);

test('a source module starts with use client exactly when it runs on the client', () => {
  const marked = sourceModules.filter((file) => USE_CLIENT.test(readFileSync(SRC + file, 'utf8')));

  expect(marked).toEqual(clientModules);
});

test('every client module keeps use client in dist', () => {
  const builtWithoutDirective = clientModules
    .map((file) => file.replace(/\.tsx?$/, '.js'))
    .filter(
      (file) => !existsSync(DIST + file) || !USE_CLIENT.test(readFileSync(DIST + file, 'utf8')),
    );

  expect(builtWithoutDirective).toEqual([]);
});

test('dist keeps one module per source file behind the same entry paths', () => {
  for (const entry of ['index.js', 'react-hook-form.js', 'tanstack-form.js'])
    expect(existsSync(DIST + entry), entry).toBe(true);

  expect(existsSync(DIST + 'components/action/button/index.js')).toBe(true);
});
