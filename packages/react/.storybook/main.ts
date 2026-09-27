import type { StorybookConfig } from '@storybook/react-vite';

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
    // Show code prints each element by its function name, which minification would reduce to a
    // single letter. Only the Storybook build keeps names; the published library is unaffected.
    config.esbuild = { ...config.esbuild, keepNames: true };
    return config;
  },
};
export default config;
