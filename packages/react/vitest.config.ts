import { readdirSync, readFileSync } from 'node:fs';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import tsconfigPaths from 'vite-tsconfig-paths';
import { configDefaults, defineConfig } from 'vitest/config';

const TESTS = new URL('./tests/', import.meta.url);
const usesTheSharedClipboard = (file: string) =>
  /userEvent\.(copy|cut|paste)\(|navigator\.clipboard/.test(
    readFileSync(new URL(file, TESTS), 'utf8'),
  );
const clipboardSuites = readdirSync(TESTS)
  .filter((file) => file.endsWith('.test.tsx') && usesTheSharedClipboard(file))
  .map((file) => `tests/${file}`);

const chromium = () => ({
  enabled: true,
  headless: true,
  provider: playwright({ contextOptions: { reducedMotion: 'reduce' } }),
  instances: [{ browser: 'chromium' as const }],
});

export default defineConfig({
  plugins: [tsconfigPaths({ projects: ['./tsconfig.json'] }), tailwindcss(), react()],
  optimizeDeps: { include: ['@floating-ui/react'] },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'browser',
          include: ['tests/**/*.test.tsx'],
          exclude: [...configDefaults.exclude, ...clipboardSuites],
          setupFiles: ['tests/setup.ts'],
          browser: chromium(),
        },
      },
      {
        extends: true,
        test: {
          name: 'clipboard',
          include: clipboardSuites,
          setupFiles: ['tests/setup.ts'],
          fileParallelism: false,
          browser: chromium(),
        },
      },
      {
        extends: true,
        test: {
          name: 'node',
          include: ['tests/**/*.test.ts'],
          environment: 'node',
        },
      },
    ],
  },
});
