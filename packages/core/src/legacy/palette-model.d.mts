import type { legacyPaletteModel } from './from-ir.ts';

export function legacyPaletteModelOutputs(
  inputs: ReturnType<typeof legacyPaletteModel>,
): Record<string, string>;
