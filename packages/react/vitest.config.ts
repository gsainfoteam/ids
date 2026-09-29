import { readdirSync, readFileSync } from 'node:fs';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import tsconfigPaths from 'vite-tsconfig-paths';
import { configDefaults, defineConfig } from 'vitest/config';

const TESTS = new URL('./tests/', import.meta.url);
const SERVER_RENDER_SUITES = 'tests/**/*.ssr.test.tsx';
const VISUAL_SUITES = 'tests/**/*.visual.test.tsx';
const RENDERS_THE_VISUAL_REFERENCE = process.env.IDS_VISUAL_REFERENCE === '1';
const usesTheSharedClipboard = (file: string) =>
  /userEvent\.(copy|cut|paste)\(|navigator\.clipboard/.test(
    readFileSync(new URL(file, TESTS), 'utf8'),
  );
const clipboardSuites = readdirSync(TESTS)
  .filter(
    (file) =>
      file.endsWith('.test.tsx') &&
      !file.endsWith('.ssr.test.tsx') &&
      !file.endsWith('.visual.test.tsx') &&
      usesTheSharedClipboard(file),
  )
  .map((file) => `tests/${file}`);

const chromium = (viewport?: { width: number; height: number }) => ({
  enabled: true,
  headless: true,
  provider: playwright({ contextOptions: { reducedMotion: 'reduce' } }),
  instances: [{ browser: 'chromium' as const }],
  ...(viewport && { viewport }),
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
          exclude: [
            ...configDefaults.exclude,
            ...clipboardSuites,
            SERVER_RENDER_SUITES,
            VISUAL_SUITES,
          ],
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
          name: 'visual',
          include: [VISUAL_SUITES],
          setupFiles: ['tests/visual-setup.ts'],
          provide: { visualReference: RENDERS_THE_VISUAL_REFERENCE },
          browser: chromium({ width: 1440, height: 900 }),
        },
      },
      {
        extends: true,
        test: {
          name: 'ssr',
          include: [SERVER_RENDER_SUITES],
          environment: 'node',
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
