import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import preserveDirectives from 'rollup-preserve-directives';
import { defineConfig, type Plugin } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

import { messages } from './src/internal/messages';

const manifest = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};

const external = [
  ...Object.keys(manifest.dependencies ?? {}),
  ...Object.keys(manifest.peerDependencies ?? {}),
].map((name) => new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}($|/)`));

const messageCatalogs = (): Plugin => ({
  name: 'ids:message-catalogs',
  apply: 'build',
  generateBundle() {
    const english = readFileSync(new URL('./messages/en.json', import.meta.url), 'utf8');
    this.emitFile({
      type: 'asset',
      fileName: 'messages/ko.json',
      source: `${JSON.stringify(messages, null, 2)}\n`,
    });
    this.emitFile({ type: 'asset', fileName: 'messages/en.json', source: english });
  },
});

export default defineConfig({
  plugins: [
    tsconfigPaths({ projects: ['./tsconfig.json'] }),
    tailwindcss(),
    react(),
    preserveDirectives(),
    messageCatalogs(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    lib: {
      entry: {
        index: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        'react-hook-form': fileURLToPath(new URL('./src/react-hook-form.tsx', import.meta.url)),
        'tanstack-form': fileURLToPath(new URL('./src/tanstack-form.tsx', import.meta.url)),
      },
      formats: ['es'],
      fileName: (_format, entry) => `${entry}.js`,
    },
    rollupOptions: {
      external,
      output: { preserveModules: true, preserveModulesRoot: 'src' },
      treeshake: { moduleSideEffects: false },
    },
  },
});
