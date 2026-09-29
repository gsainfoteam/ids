import type { StorybookConfig } from '@storybook/react-vite';
import type { Plugin } from 'vite';

const keepNamesForShowCode = { keepNames: true };

const COMPONENT_INDEX = /\/src\/components\/[^/]+\/[^/]+\/index\.tsx$/;

const docsReadFromTheRoot = (): Plugin => ({
  name: 'ids:docs-read-from-the-root',
  enforce: 'post',
  transform(code, id) {
    if (!COMPONENT_INDEX.test(id)) return;
    const component = code.match(/export function (\w+)\(props\)/)?.[1];
    if (!component || !code.includes(`${component}Root`)) return;
    const docs = `{ ...${component}Root.__docgenInfo, displayName: ${JSON.stringify(component)} }`;
    return { code: `${code}\n${component}.__docgenInfo = ${docs};\n`, map: null };
  },
});

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-themes', '@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  async viteFinal(config) {
    const { default: tailwindcss } = await import('@tailwindcss/vite');
    config.plugins = config.plugins || [];
    config.plugins.push(tailwindcss(), docsReadFromTheRoot());
    config.esbuild = { ...config.esbuild, ...keepNamesForShowCode };
    return config;
  },
};
export default config;
