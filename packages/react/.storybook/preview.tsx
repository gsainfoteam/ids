import { useGlobals } from 'storybook/preview-api';

import { ThemeProvider } from '../src/components/utility/theme-provider';

import type { Decorator, Preview } from '@storybook/react-vite';

import '../src/styles.css';
import './preview.css';

// The toolbar owns the theme, so a story that calls useTheme().setMode moves the toolbar too.
// A story fills the canvas on its own page, but on a Docs page every story is one block among
// many, so it only takes the room it needs there.
const withIdsTheme: Decorator = (Story, context) => {
  const [globals, updateGlobals] = useGlobals();

  return (
    <ThemeProvider
      color={globals['idsColor'] ?? 'blue'}
      mode={globals['idsMode'] ?? 'light'}
      onColorChange={(color) => updateGlobals({ idsColor: color })}
      onModeChange={(mode) => updateGlobals({ idsMode: mode })}
      className={
        context.viewMode === 'docs'
          ? 'rounded-standard w-full bg-(--ids-color-surface) p-6 text-(--ids-color-on-surface)'
          : 'min-h-screen w-full bg-(--ids-color-surface) p-8 text-(--ids-color-on-surface)'
      }
    >
      <Story />
    </ThemeProvider>
  );
};

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    // The code of the story on screen, beside the canvas; Docs pages keep their own Show code.
    docs: { codePanel: true },
    // Handlers in args are spies with generated names; a reader only needs to see one is passed.
    jsx: { showFunctions: true, functionValue: () => '() => {}' },
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
          ['Color', 'Typography', 'Radius', 'InteractiveState'],
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
        items: ['light', 'dark', 'system'],
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
