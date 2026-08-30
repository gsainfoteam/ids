//  @ts-check

import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

/** @type {import('prettier').Config} */
const config = {
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
  printWidth: 100,
  plugins: [require.resolve('prettier-plugin-tailwindcss')],
};

export default config;
