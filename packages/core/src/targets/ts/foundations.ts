import { mapValues } from 'es-toolkit/object';

import type { DimensionToken, Ir } from '../../ir/schema.ts';
import { outputOf, writeFormatted } from '../output.ts';

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
  await writeFormatted(outputOf(root, ir, 'ts', FOUNDATIONS), JSON.stringify(foundationsData(ir)));
}
