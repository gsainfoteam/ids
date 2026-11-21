import { composeStories, type Meta, type StoryObj } from '@storybook/react-vite';
import { describe, expect, test } from 'vitest';

type StoryFile = Record<string, StoryObj> & { default: Meta };

const FILES_ON_THE_THREE_LAYERS = [
  'components/action/button/index.stories.tsx',
  'components/action/button-group/index.stories.tsx',
  'components/form/select/index.stories.tsx',
];

const BASIC = ['Playground', 'Usage', 'Gallery'];
const VERIFICATION = 'verification';
const ALWAYS_VERIFICATION = /^(Keyboard|RightToLeft|DevelopmentWarnings)/;

const storyFiles = import.meta.glob<StoryFile>('../src/**/*.stories.tsx', { eager: true });
const storySources = import.meta.glob<string>('../src/**/*.stories.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

const storyNamesInSourceOrder = (source: string) =>
  [...source.matchAll(/^export const (\w+)\b/gm)].map((match) => match[1]!);

const storyDescription = (story: { parameters: Record<string, unknown> }) =>
  (story.parameters['docs'] as { description?: { story?: string } } | undefined)?.description
    ?.story;

for (const file of FILES_ON_THE_THREE_LAYERS) {
  describe(file, () => {
    const path = `../src/${file}`;
    const module = storyFiles[path];
    const source = storySources[path];

    test('exists', () => {
      expect(module, `${file} is listed but not found`).toBeDefined();
    });
    if (!module || !source) return;

    const stories = composeStories(module);
    const names = storyNamesInSourceOrder(source);
    const isVerification = (name: string) =>
      stories[name]!.tags.includes(VERIFICATION);
    const rest = names.slice(BASIC.length);
    const examples = rest.filter((name) => !isVerification(name));
    const checks = rest.filter(isVerification);

    test('starts with Playground, Usage and Gallery', () => {
      expect(names.slice(0, BASIC.length)).toEqual(BASIC);
      expect(BASIC.filter(isVerification)).toEqual([]);
    });

    test('puts examples before verification stories', () => {
      expect(rest).toEqual([...examples, ...checks]);
    });

    test('describes every example', () => {
      const undescribed = examples.filter((name) => !storyDescription(stories[name]!)?.trim());
      expect(undescribed, 'examples without parameters.docs.description.story').toEqual([]);
    });

    test('marks keyboard, right-to-left and warning stories as verification', () => {
      const unmarked = examples.filter((name) => ALWAYS_VERIFICATION.test(name));
      expect(unmarked, `stories that need tags: ['${VERIFICATION}']`).toEqual([]);
    });
  });
}
