import type { Preview, ReactRenderer } from '@storybook/react-vite';
import type { DecoratorFunction } from 'storybook/internal/types';

import '../src/styles.css';

const withIdsTheme: DecoratorFunction<ReactRenderer> = (Story, context) => {
  const color = context.globals['idsColor'] ?? 'blue';
  const mode = context.globals['idsMode'] ?? 'light';

  return (
    <div data-color={color} data-mode={mode}>
      <Story />
    </div>
  );
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  globalTypes: {
    idsColor: {
      description: 'IDS color theme',
      toolbar: {
        title: 'Color',
        icon: 'paintbrush',
        items: ['blue', 'orange', 'green'],
        dynamicTitle: true,
      },
    },
    idsMode: {
      description: 'IDS color mode',
      toolbar: {
        title: 'Mode',
        icon: 'mirror',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    idsColor: 'blue',
    idsMode: 'light',
  },
  decorators: [withIdsTheme],
};

export default preview;
