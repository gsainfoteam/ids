import { ThemeProvider } from '../src/components/utility/theme-provider';

import type { Decorator, Preview } from '@storybook/react-vite';

import '../src/styles.css';
import './preview.css';

// ThemeProvider takes color and mode as initial state, so the toolbar remounts it by key.
const withIdsTheme: Decorator = (Story, context) => {
  const color = context.globals['idsColor'] ?? 'blue';
  const mode = context.globals['idsMode'] ?? 'light';

  return (
    <ThemeProvider key={`${color}:${mode}`} color={color} mode={mode}>
      <div className="min-h-screen w-full bg-(--ids-color-surface) p-8 text-(--ids-color-on-surface)">
        <Story />
      </div>
    </ThemeProvider>
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
    options: {
      storySort: {
        order: [
          'Foundations',
          'Action',
          'Form',
          'Data',
          'Feedback',
          'Layout',
          'Navigation',
          'Overlay',
          'Typography',
          'Utility',
          '*',
        ],
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
