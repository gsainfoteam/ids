import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

test('base ESM and CommonJS exports load when react-hook-form cannot resolve', () => {
  const result = spawnSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `
    import { registerHooks, createRequire } from 'node:module';
    registerHooks({ resolve(specifier, context, nextResolve) {
      if (specifier === 'react-hook-form') throw new Error('Optional peer is unavailable');
      return nextResolve(specifier, context);
    }});
    const esm = await import('./dist/index.js');
    const cjs = createRequire(import.meta.url)('./dist/index.cjs');
    if (!esm.Field || !cjs.Field || !esm.TextField || !cjs.TextField) process.exit(1);
  `,
    ],
    { cwd: fileURLToPath(new URL('../', import.meta.url)), encoding: 'utf8' },
  );
  assert.equal(result.status, 0, result.stderr);
});
