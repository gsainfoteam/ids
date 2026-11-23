import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Ir } from '../ir/schema.ts';

const NODE_MODULES = 'node_modules/';

export function copyBundledFonts(root: URL, ir: Ir) {
  const packageRoot = new URL(ir.packages.dart.directory, root);
  const modules = new URL(NODE_MODULES, root);
  for (const { font, license } of ir.fonts.bundled) {
    for (const { from, to } of [font, license]) {
      const destination = new URL(to, packageRoot);
      mkdirSync(dirname(fileURLToPath(destination)), { recursive: true });
      copyFileSync(new URL(from, modules), destination);
    }
  }
}
