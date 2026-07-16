import type { Decorator, Preview } from '@storybook/react-vite';

import '../src/styles.css';
import './preview.css';

const withIdsTheme: Decorator = (Story, context) => {
  const color = context.globals['idsColor'] ?? 'blue';
  const mode = context.globals['idsMode'] ?? 'light';

  return (
    <div
      data-color={color}
      data-mode={mode}
      className="min-h-screen w-full bg-(--ids-color-surface) p-6 text-(--ids-color-on-surface)"
    >
      <Story />
    </div>
  );
};

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    backgrounds: { disable: true },
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
