import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { format, resolveConfig } from 'prettier';

import type { Ir } from '../ir/schema.ts';
import { SourceError } from '../sources/load.ts';

type Target = keyof Ir['targets'];

export interface Output {
  file: URL;
  path: string;
}

export function outputOf(root: URL, ir: Ir, target: Target, output: string): Output {
  const declared = ir.targets[target].outputs[output];
  if (!declared)
    throw new SourceError(`config/targets.json: targets.${target}.outputs.${output}: missing`);
  const file = new URL(declared, new URL(ir.packages[target].directory, root));
  return { file, path: fileURLToPath(file) };
}

export async function formatted(output: Output, source: string) {
  const options = await resolveConfig(output.path);
  return format(source, { ...options, filepath: output.path });
}

export async function writeFormatted(output: Output, source: string) {
  writeFileSync(output.file, await formatted(output, source));
}
