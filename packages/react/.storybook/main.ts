import type { StorybookConfig } from '@storybook/react-vite';

const keepNamesForShowCode = { keepNames: true };

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
    config.plugins.push(tailwindcss());
    config.esbuild = { ...config.esbuild, ...keepNamesForShowCode };
    return config;
  },
};
export default config;
