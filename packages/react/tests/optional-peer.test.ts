import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { expect, test } from 'vitest';

const coldNodeStartOnABusyRunner = 30_000;

test(
  'the ESM entry loads when no form library can resolve',
  () => {
    const result = spawnSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        `
    import { registerHooks } from 'node:module';
    registerHooks({ resolve(specifier, context, nextResolve) {
      if (specifier === 'react-hook-form' || specifier === '@tanstack/react-form')
        throw new Error('Optional peer is unavailable');
      return nextResolve(specifier, context);
    }});
    const ids = await import('./dist/index.js');
    if (!ids.Field || !ids.TextField) process.exit(1);
  `,
      ],
      { cwd: fileURLToPath(new URL('../', import.meta.url)), encoding: 'utf8' },
    );
    expect(result.status, result.stderr).toBe(0);
  },
  coldNodeStartOnABusyRunner,
);
