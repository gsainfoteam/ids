import { toJsonSchemaDefs, toJsonSchema } from '@valibot/to-json-schema';
import { mkdirSync, writeFileSync } from 'node:fs';

import { IR_DEFINITIONS, IrSchema, type Ir } from './schema.ts';

export const IR_FILE = 'out/ir.json';

export const IR_SCHEMA_FILE = 'ir.schema.json';

const JSON_INDENT = 2;

const jsonFile = (data: unknown) => JSON.stringify(data, null, JSON_INDENT).concat('\n');

export function irJsonSchema() {
  return toJsonSchema(IrSchema, { target: 'draft-2020-12', definitions: IR_DEFINITIONS });
}

export { toJsonSchemaDefs };

export function writeIr(root: URL, ir: Ir) {
  const file = new URL(IR_FILE, root);
  mkdirSync(new URL('.', file), { recursive: true });
  writeFileSync(file, jsonFile(ir));
  writeFileSync(new URL(IR_SCHEMA_FILE, root), jsonFile(irJsonSchema()));
}
