import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const manifest = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};

const external = [
  ...Object.keys(manifest.dependencies ?? {}),
  ...Object.keys(manifest.peerDependencies ?? {}),
].map((name) => new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}($|/)`));

export default defineConfig({
  plugins: [tsconfigPaths({ projects: ['./tsconfig.json'] }), tailwindcss(), react()],
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
      name: 'IdsReact',
      formats: ['es', 'cjs'],
      fileName: (format, entry) => `${entry}.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external,
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
});
