import { useGlobals } from 'storybook/preview-api';

import { IdsStoryFrame } from './ids-story-frame';
import { LiveCodeDocsPage } from './live-code';
import { paletteHues } from './palettes';

import type { Decorator, Preview } from '@storybook/react-vite';

import '../src/styles.css';
import './preview.css';

const DERIVED = 'derived';

const WCAG_2_CONTRAST_REPLACED_BY_APCA = 'color-contrast';

const labelled = (name: string, values: readonly string[]) =>
  values.map((value) => ({ value, title: `${name} ${value}` }));

const withIdsTheme: Decorator = (Story, context) => {
  const [globals, updateGlobals] = useGlobals();
  const oneBlockAmongMany = context.viewMode === 'docs';
  const pageFillsTheCanvas = context.parameters['canvasPadding'] === false;

  return (
    <IdsStoryFrame
      globals={globals}
      updateGlobals={updateGlobals}
      placement={oneBlockAmongMany ? 'docs' : pageFillsTheCanvas ? 'page' : 'padded'}
    >
      <Story />
    </IdsStoryFrame>
  );
};

const hideSpyNames = () => '() => {}';

type ElementType =
  | string
  | symbol
  | {
      displayName?: string;
      name?: string;
      render?: { displayName?: string; name?: string };
      type?: { name?: string };
    };

const nameInShowCode = ({ type }: { type: ElementType }) => {
  if (typeof type === 'string') return type;
  if (typeof type === 'symbol') return type.description ?? 'Unknown';
  return (
    type.displayName ||
    type.render?.displayName ||
    type.render?.name ||
    type.type?.name ||
    type.name ||
    'Unknown'
  );
};

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    docs: { codePanel: true, page: LiveCodeDocsPage },
    jsx: { showFunctions: true, functionValue: hideSpyNames, displayName: nameInShowCode },
    backgrounds: { disable: true },
    a11y: {
      options: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'],
        },
        rules: { [WCAG_2_CONTRAST_REPLACED_BY_APCA]: { enabled: false } },
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
          'Blocks',
          '*',
        ],
      },
    },
  },
  globalTypes: {
    idsColor: {
      description: 'The primary palette of the repository demo theme',
      toolbar: {
        title: 'Primary',
        icon: 'paintbrush',
        items: labelled('primary', paletteHues),
        dynamicTitle: true,
      },
    },
    idsSecondary: {
      description: 'The secondary palette of the demo theme, or derived from primary',
      toolbar: {
        title: 'Secondary',
        icon: 'paintbrush',
        items: labelled('secondary', [DERIVED, ...paletteHues]),
        dynamicTitle: true,
      },
    },
    idsTertiary: {
      description: 'The tertiary palette of the demo theme, or derived from primary',
      toolbar: {
        title: 'Tertiary',
        icon: 'paintbrush',
        items: labelled('tertiary', [DERIVED, ...paletteHues]),
        dynamicTitle: true,
      },
    },
    idsNeutral: {
      description: 'Pure gray, or gray tinted with the primary hue',
      toolbar: {
        title: 'Neutral',
        icon: 'contrast',
        items: labelled('neutral', ['pure', 'tinted']),
        dynamicTitle: true,
      },
    },
    idsStatus: {
      description: 'Status hues turned toward primary, or the fixed references',
      toolbar: {
        title: 'Status',
        icon: 'sync',
        items: [
          { value: 'harmonized', title: 'status harmonized', icon: 'sync' },
          { value: 'fixed', title: 'status fixed', icon: 'lock' },
        ],
        dynamicTitle: true,
      },
    },
    idsCornerShape: {
      description: 'IDS corner shape',
      toolbar: {
        title: 'Corner',
        icon: 'circlehollow',
        items: [
          { value: 'round', title: 'corner round', icon: 'circlehollow' },
          { value: 'squircle', title: 'corner squircle', icon: 'outline' },
        ],
        dynamicTitle: true,
      },
    },
    idsMode: {
      description: 'IDS color mode',
      toolbar: {
        title: 'Mode',
        icon: 'sun',
        items: [
          { value: 'light', title: 'light', icon: 'sun' },
          { value: 'dark', title: 'dark', icon: 'moon' },
          { value: 'system', title: 'system', icon: 'browser' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    idsColor: 'blue',
    idsSecondary: DERIVED,
    idsTertiary: DERIVED,
    idsNeutral: 'pure',
    idsStatus: 'harmonized',
    idsMode: 'light',
    idsCornerShape: 'round',
  },
  decorators: [withIdsTheme],
};

export default preview;
