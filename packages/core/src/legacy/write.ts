import { writeFileSync } from 'node:fs';

import type { Ir } from '../ir/schema.ts';
import { legacyTokenOutputs } from './formats.mjs';
import { legacyInputs, legacyPaletteModel } from './from-ir.ts';
import { legacyPaletteModelOutputs } from './palette-model.mjs';

export function legacyOutputs(ir: Ir): Record<string, string> {
  return {
    ...legacyTokenOutputs(legacyInputs(ir)),
    ...legacyPaletteModelOutputs(legacyPaletteModel(ir)),
  };
}

export function writeLegacyOutputs(root: URL, ir: Ir) {
  for (const [file, source] of Object.entries(legacyOutputs(ir))) {
    writeFileSync(new URL(file, root), source);
  }
}
