import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { IR_FILE, IR_SCHEMA_FILE } from '../../ir/write.ts';

const DART = 'dart';
const DART_PACKAGE = 'dart/';
const PRINT = '--print';
const MODEL = 'bin/model.dart';
const EMIT = 'bin/emit.dart';

const pathOf = (url: URL) => fileURLToPath(url);

function run(root: URL, script: string, inputs: readonly string[], print: boolean) {
  const packageDirectory = new URL(DART_PACKAGE, root);
  return execFileSync(DART, ['run', script, ...inputs, ...(print ? [PRINT] : [])], {
    cwd: pathOf(packageDirectory),
    encoding: 'utf8',
    stdio: print ? ['ignore', 'pipe', 'inherit'] : 'inherit',
  });
}

const modelInputs = (root: URL) => [
  pathOf(new URL(IR_SCHEMA_FILE, root)),
  pathOf(new URL(DART_PACKAGE, root)),
];

const tokenInputs = (root: URL, irFile: URL) => [pathOf(irFile), pathOf(root)];

export function dartOutputs(root: URL, irFile: URL): Record<string, string> {
  return {
    ...(JSON.parse(run(root, MODEL, modelInputs(root), true)) as Record<string, string>),
    ...(JSON.parse(run(root, EMIT, tokenInputs(root, irFile), true)) as Record<string, string>),
  };
}

export function writeDart(root: URL) {
  run(root, MODEL, modelInputs(root), false);
  run(root, EMIT, tokenInputs(root, new URL(IR_FILE, root)), false);
}
