import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { mapValues } from 'es-toolkit/object';
import { format, resolveConfig } from 'prettier';

import type { DimensionToken, Ir } from '../../ir/schema.ts';
import { SourceError } from '../../sources/load.ts';

const FOUNDATIONS = 'foundations';

const dimensions = (tokens: readonly DimensionToken[]) =>
  tokens.map((token) => ({ name: token.name.ts.key, value: token.value }));

export function foundationsData(ir: Ir) {
  const { textStyles, ...primitives } = ir.typography;
  return {
    spacing: dimensions(ir.spacing),
    size: dimensions(ir.size),
    radius: dimensions(ir.radius),
    motion: ir.motion.map((token) => ({
      name: token.name.ts.key,
      milliseconds: token.milliseconds,
    })),
    typography: {
      textStyles: textStyles.map((style) => style.name.ts.key),
      primitives: mapValues(primitives, (tokens) =>
        tokens.map((token) => token.variable.css.customProperty),
      ),
    },
  };
}

export async function writeFoundations(root: URL, ir: Ir) {
  const output = ir.targets.ts.outputs[FOUNDATIONS];
  if (!output)
    throw new SourceError(`config/targets.json: targets.ts.outputs.${FOUNDATIONS}: missing`);
  const file = new URL(output, new URL(ir.packages.ts.directory, root));
  const filepath = fileURLToPath(file);
  const options = await resolveConfig(filepath);
  writeFileSync(file, await format(JSON.stringify(foundationsData(ir)), { ...options, filepath }));
}
