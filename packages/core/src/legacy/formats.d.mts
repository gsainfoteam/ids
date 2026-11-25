import type { legacyInputs } from './from-ir.ts';

export function legacyTokenOutputs(inputs: ReturnType<typeof legacyInputs>): Record<string, string>;
