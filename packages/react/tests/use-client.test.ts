import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { expect, test } from 'vitest';

const SRC = fileURLToPath(new URL('../src/', import.meta.url));
const DIST = fileURLToPath(new URL('../dist/', import.meta.url));

const CALLS_A_HOOK = /\buse(?:[A-Z]\w*)?\s*(?:<[^>]*>)?\s*\(/;
const CREATES_A_CONTEXT = /\bcreateContext\b/;
const USE_CLIENT = /^['"]use client['"];/;
const COMPONENT_INDEX = /^components\/[^/]+\/[^/]+\/index\.tsx$/;

const sourceModules = readdirSync(SRC, { recursive: true, encoding: 'utf8' })
  .filter((file) => /\.tsx?$/.test(file) && !/\.stories\.tsx?$/.test(file))
  .sort();

const source = (file: string) => readFileSync(SRC + file, 'utf8');
const built = (file: string) => DIST + file.replace(/\.tsx?$/, '.js');

const isReexportOnly = (code: string) =>
  code
    .split('\n')
    .every(
      (line) =>
        line.trim() === '' || /^(import |export (type )?\{|export \* from |\}|\s)/.test(line),
    );

const isComponentIndex = (file: string) => COMPONENT_INDEX.test(file);
const rootOf = (file: string) => file.replace(/index\.tsx$/, 'root.tsx');

const runsOnTheClient = (file: string, code: string) =>
  CALLS_A_HOOK.test(code) ||
  CREATES_A_CONTEXT.test(code) ||
  (file.endsWith('.tsx') && !isReexportOnly(code) && !isComponentIndex(file));

const clientModules = sourceModules.filter((file) => runsOnTheClient(file, source(file)));
const componentIndexes = sourceModules.filter(isComponentIndex);

test('a source module starts with use client exactly when it runs on the client', () => {
  const marked = sourceModules.filter((file) => USE_CLIENT.test(source(file)));

  expect(marked).toEqual(clientModules);
});

test('every component keeps its index server-safe and its root in root.tsx', () => {
  const indexesRunningClientCode = componentIndexes.filter((file) => {
    const code = source(file);
    return USE_CLIENT.test(code) || CALLS_A_HOOK.test(code) || CREATES_A_CONTEXT.test(code);
  });
  const rootsMissingOrServerSide = componentIndexes.filter(
    (file) => !existsSync(SRC + rootOf(file)) || !USE_CLIENT.test(source(rootOf(file))),
  );

  expect(componentIndexes.length).toBeGreaterThan(50);
  expect(indexesRunningClientCode).toEqual([]);
  expect(rootsMissingOrServerSide).toEqual([]);
});

test('dist keeps use client exactly where the source has it', () => {
  const clientBuiltWithoutDirective = clientModules.filter(
    (file) => !existsSync(built(file)) || !USE_CLIENT.test(readFileSync(built(file), 'utf8')),
  );
  const componentIndexesBuiltAsClient = componentIndexes.filter(
    (file) => !existsSync(built(file)) || USE_CLIENT.test(readFileSync(built(file), 'utf8')),
  );

  expect(clientBuiltWithoutDirective).toEqual([]);
  expect(componentIndexesBuiltAsClient).toEqual([]);
});

test('dist keeps one module per source file behind the same entry paths', () => {
  for (const entry of ['index.js', 'react-hook-form.js', 'tanstack-form.js'])
    expect(existsSync(DIST + entry), entry).toBe(true);

  expect(existsSync(DIST + 'components/action/button/index.js')).toBe(true);
});
