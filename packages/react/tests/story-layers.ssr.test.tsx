import { composeStories, type Meta, type StoryObj } from '@storybook/react-vite';
import { describe, expect, test } from 'vitest';

type StoryFile = Record<string, StoryObj> & { default: Meta };

const NOT_YET_ON_THE_THREE_LAYERS = new Set([
  'components/data/bubble/index.stories.tsx',
  'components/data/calendar/index.stories.tsx',
  'components/data/chip/index.stories.tsx',
  'components/data/image/index.stories.tsx',
  'components/data/item/index.stories.tsx',
  'components/data/table/index.stories.tsx',
  'components/data/time-picker/index.stories.tsx',
  'components/form/date-field/index.stories.tsx',
  'components/form/date-time-field/index.stories.tsx',
  'components/form/editor/index.stories.tsx',
  'components/form/time-field/index.stories.tsx',
  'components/layout/scroll-area/index.stories.tsx',
  'components/utility/ids-provider/index.stories.tsx',
]);

const BASIC = ['Playground', 'Usage', 'Gallery'];
const VERIFICATION = 'verification';
const ALWAYS_VERIFICATION = /^(Keyboard|RightToLeft|DevelopmentWarnings)/;

const storyFiles = import.meta.glob<StoryFile>('../src/components/**/*.stories.tsx', {
  eager: true,
});
const storySources = import.meta.glob<string>('../src/components/**/*.stories.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

const relativePath = (path: string) => path.replace('../src/', '');

const storyNamesInSourceOrder = (source: string) =>
  [...source.matchAll(/^export const (\w+)\b/gm)].map((match) => match[1]!);

const storyDescription = (story: { parameters: Record<string, unknown> }) =>
  (story.parameters['docs'] as { description?: { story?: string } } | undefined)?.description
    ?.story;

function layerProblems(module: StoryFile, source: string) {
  const stories = composeStories(module);
  const names = storyNamesInSourceOrder(source);
  const isVerification = (name: string) => stories[name]!.tags.includes(VERIFICATION);
  const rest = names.slice(BASIC.length);
  const examples = rest.filter((name) => !isVerification(name));
  const checks = rest.filter(isVerification);
  const problems: string[] = [];

  const basic = names.slice(0, BASIC.length);
  if (basic.join() !== BASIC.join()) {
    problems.push(`starts with ${basic.join(', ')} instead of ${BASIC.join(', ')}`);
  }
  for (const name of BASIC.filter((name) => names.includes(name) && isVerification(name))) {
    problems.push(`${name} is a basic story but carries tags: ['${VERIFICATION}']`);
  }

  const anExampleFollows = (name: string) =>
    rest.slice(rest.indexOf(name) + 1).some((later) => !isVerification(later));
  for (const name of checks.filter(anExampleFollows)) {
    problems.push(`${name} is a verification story placed before an example`);
  }

  for (const name of examples.filter((name) => !storyDescription(stories[name]!)?.trim())) {
    problems.push(`${name} is an example without parameters.docs.description.story`);
  }

  for (const name of examples.filter((name) => ALWAYS_VERIFICATION.test(name))) {
    problems.push(`${name} needs tags: ['${VERIFICATION}']`);
  }

  return problems;
}

const files = Object.keys(storyFiles).map(relativePath).sort();

describe('the list of files not yet on the three layers', () => {
  test('names only story files that exist', () => {
    const missing = [...NOT_YET_ON_THE_THREE_LAYERS].filter((file) => !files.includes(file));
    expect(missing, 'listed in NOT_YET_ON_THE_THREE_LAYERS but not found').toEqual([]);
  });
});

for (const file of files) {
  const module = storyFiles[`../src/${file}`]!;
  const source = storySources[`../src/${file}`]!;

  if (NOT_YET_ON_THE_THREE_LAYERS.has(file)) {
    test(`${file} is still off the three layers`, () => {
      expect(
        layerProblems(module, source),
        `${file} is on the three layers now: remove it from NOT_YET_ON_THE_THREE_LAYERS`,
      ).not.toEqual([]);
    });
    continue;
  }

  test(`${file} is on the three layers`, () => {
    expect(
      layerProblems(module, source),
      `${file} breaks the story layers`,
    ).toEqual([]);
  });
}
