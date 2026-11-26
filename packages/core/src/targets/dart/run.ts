import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import { IR_FILE, IR_SCHEMA_FILE } from '../../ir/write.ts';

const DART = 'dart';
const DART_PACKAGE = 'dart/';
const PRINT = '--print';
const MODEL = 'bin/model.dart';
const EMIT = 'bin/emit.dart';

const execFileAsync = promisify(execFile);

const pathOf = (url: URL) => fileURLToPath(url);

async function run(root: URL, script: string, inputs: readonly string[], print: boolean) {
  const packageDirectory = new URL(DART_PACKAGE, root);
  const running = execFileAsync(DART, ['run', script, ...inputs, ...(print ? [PRINT] : [])], {
    cwd: pathOf(packageDirectory),
    encoding: 'utf8',
  });

  if (!print) running.child.stdout?.pipe(process.stdout);
  running.child.stderr?.pipe(process.stderr);

  const { stdout } = await running;
  return stdout;
}

const modelInputs = (root: URL) => [
  pathOf(new URL(IR_SCHEMA_FILE, root)),
  pathOf(new URL(DART_PACKAGE, root)),
];

const tokenInputs = (root: URL, irFile: URL) => [pathOf(irFile), pathOf(root)];

export async function dartOutputs(root: URL, irFile: URL): Promise<Record<string, string>> {
  const model = await run(root, MODEL, modelInputs(root), true);
  const tokens = await run(root, EMIT, tokenInputs(root, irFile), true);

  return {
    ...(JSON.parse(model) as Record<string, string>),
    ...(JSON.parse(tokens) as Record<string, string>),
  };
}

export async function writeDart(root: URL) {
  await run(root, MODEL, modelInputs(root), false);
  await run(root, EMIT, tokenInputs(root, new URL(IR_FILE, root)), false);
}
