import { useGlobals } from 'storybook/preview-api';

import { IdsProvider } from '../src/components/utility/ids-provider';

import type { Decorator, Preview } from '@storybook/react-vite';

import '../src/styles.css';
import './preview.css';

const withIdsTheme: Decorator = (Story, context) => {
  const [globals, updateGlobals] = useGlobals();
  const oneBlockAmongMany = context.viewMode === 'docs';

  return (
    <IdsProvider
      color={globals['idsColor'] ?? 'blue'}
      mode={globals['idsMode'] ?? 'light'}
      onColorChange={(color) => updateGlobals({ idsColor: color })}
      onModeChange={(mode) => updateGlobals({ idsMode: mode })}
      className={
        oneBlockAmongMany
          ? 'rounded-standard w-full bg-(--ids-color-surface) p-6 text-(--ids-color-on-surface)'
          : 'min-h-screen w-full bg-(--ids-color-surface) p-8 text-(--ids-color-on-surface)'
      }
    >
      <Story />
    </IdsProvider>
  );
};

const hideSpyNames = () => '() => {}';

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    docs: { codePanel: true },
    jsx: { showFunctions: true, functionValue: hideSpyNames },
    backgrounds: { disable: true },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        method: 'alphabetical',
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
