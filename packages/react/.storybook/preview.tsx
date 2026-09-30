import { use, useEffect } from 'react';

import { useGlobals } from 'storybook/preview-api';

import enums from '../../core/tokens/enums.json';
import { IdsProvider, useTheme } from '../src/components/utility/ids-provider';
import { PortalRootContext } from '../src/internal/overlay';

import type { Decorator, Preview } from '@storybook/react-vite';

import '../src/styles.css';
import './preview.css';

function PaintThePageBehindWideStories() {
  const { resolvedMode } = useTheme();
  const provider = use(PortalRootContext);

  useEffect(() => {
    if (provider) document.body.style.backgroundColor = getComputedStyle(provider).backgroundColor;
  }, [provider, resolvedMode]);

  return null;
}

const withIdsTheme: Decorator = (Story, context) => {
  const [globals, updateGlobals] = useGlobals();
  const oneBlockAmongMany = context.viewMode === 'docs';
  const pageFillsTheCanvas = context.parameters['canvasPadding'] === false;

  return (
    <IdsProvider
      color={globals['idsColor'] ?? 'blue'}
      mode={globals['idsMode'] ?? 'light'}
      onColorChange={(color) => updateGlobals({ idsColor: color })}
      onModeChange={(mode) => updateGlobals({ idsMode: mode })}
      className={
        oneBlockAmongMany
          ? 'rounded-standard w-full bg-(--ids-color-surface) p-6 text-(--ids-color-on-surface)'
          : pageFillsTheCanvas
            ? 'min-h-screen w-full bg-(--ids-color-surface) text-(--ids-color-on-surface)'
            : 'min-h-screen w-full bg-(--ids-color-surface) p-8 text-(--ids-color-on-surface)'
      }
    >
      <PaintThePageBehindWideStories />
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
    a11y: {
      options: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'],
        },
      },
      test: 'error',
    },
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
          'Overview',
          'Foundations',
          [
            'Color',
            'Palette',
            'Typography',
            'Spacing',
            'Size',
            'Radius',
            'Motion',
            'InteractiveState',
          ],
          'Action',
          'Form',
          'Data',
          'Feedback',
          'Layout',
          'Navigation',
          'Overlay',
          'Typography',
          'Utility',
          'Patterns',
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
        items: enums.ids.color.values.$value,
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
