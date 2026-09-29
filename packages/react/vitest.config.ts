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

type BrowserName = 'chromium' | 'firefox' | 'webkit';

const EVERY_ENGINE: BrowserName[] = ['chromium', 'firefox', 'webkit'];
const chosenEngines = process.env.IDS_BROWSERS?.split(',') as BrowserName[] | undefined;
const LINUX_KEYBOARD_MODEL = process.platform === 'linux';
const ENGINES = chosenEngines ?? (LINUX_KEYBOARD_MODEL ? EVERY_ENGINE : ['chromium']);

const FIREFOX_SHARES_FOCUS_ACROSS_PARALLEL_PAGES: BrowserName = 'firefox';
const WEBKIT_STALLS_ANIMATIONS_IN_PARALLEL_PAGES: BrowserName = 'webkit';
const ONE_FILE_AT_A_TIME: BrowserName[] = [
  FIREFOX_SHARES_FOCUS_ACROSS_PARALLEL_PAGES,
  WEBKIT_STALLS_ANIMATIONS_IN_PARALLEL_PAGES,
];
const everyFileOneAtATime = {
  fileParallelism: false,
  include: ['tests/**/*.test.tsx'],
  exclude: [...configDefaults.exclude, SERVER_RENDER_SUITES, VISUAL_SUITES],
};

const playwrightIn = (browsers: BrowserName[], viewport?: { width: number; height: number }) => ({
  enabled: true,
  headless: true,
  provider: playwright({
    contextOptions: {
      reducedMotion: 'reduce',
    },
  }),
  instances: browsers.map((browser) => ({
    browser,
    ...(ONE_FILE_AT_A_TIME.includes(browser) && everyFileOneAtATime),
  })),
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
          browser: playwrightIn(ENGINES),
        },
      },
      {
        extends: true,
        test: {
          name: 'clipboard',
          include: clipboardSuites,
          setupFiles: ['tests/setup.ts'],
          fileParallelism: false,
          browser: playwrightIn(ENGINES.filter((engine) => !ONE_FILE_AT_A_TIME.includes(engine))),
        },
      },
      {
        extends: true,
        test: {
          name: 'visual',
          include: [VISUAL_SUITES],
          setupFiles: ['tests/visual-setup.ts'],
          provide: { visualReference: RENDERS_THE_VISUAL_REFERENCE },
          browser: playwrightIn(['chromium'], { width: 1440, height: 900 }),
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
