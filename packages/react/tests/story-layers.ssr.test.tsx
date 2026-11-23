import { composeStories, type Meta, type StoryObj } from '@storybook/react-vite';
import { describe, expect, test } from 'vitest';

type StoryFile = Record<string, StoryObj> & { default: Meta };

const NOT_YET_ON_THE_THREE_LAYERS = new Set([
  'components/action/floating-button/index.stories.tsx',
  'components/action/icon-button/index.stories.tsx',
  'components/action/icon-toggle/index.stories.tsx',
  'components/action/toggle-group/index.stories.tsx',
  'components/action/toggle/index.stories.tsx',
  'components/data/accordion/index.stories.tsx',
  'components/data/bubble/index.stories.tsx',
  'components/data/calendar/index.stories.tsx',
  'components/data/card/index.stories.tsx',
  'components/data/carousel/index.stories.tsx',
  'components/data/chart/index.stories.tsx',
  'components/data/chip/index.stories.tsx',
  'components/data/code-block/index.stories.tsx',
  'components/data/color-picker/index.stories.tsx',
  'components/data/data-table/index.stories.tsx',
  'components/data/empty/index.stories.tsx',
  'components/data/image/index.stories.tsx',
  'components/data/item/index.stories.tsx',
  'components/data/marquee/index.stories.tsx',
  'components/data/qr-code/index.stories.tsx',
  'components/data/table/index.stories.tsx',
  'components/data/time-picker/index.stories.tsx',
  'components/feedback/alert/index.stories.tsx',
  'components/feedback/marker/index.stories.tsx',
  'components/feedback/spinner/index.stories.tsx',
  'components/feedback/toast/index.stories.tsx',
  'components/form/checkbox-group/index.stories.tsx',
  'components/form/checkbox/index.stories.tsx',
  'components/form/chip-field/index.stories.tsx',
  'components/form/color-field/index.stories.tsx',
  'components/form/date-field/index.stories.tsx',
  'components/form/date-time-field/index.stories.tsx',
  'components/form/editor/index.stories.tsx',
  'components/form/field/index.stories.tsx',
  'components/form/field/zod.stories.tsx',
  'components/form/file-field/index.stories.tsx',
  'components/form/input/index.stories.tsx',
  'components/form/number-field/index.stories.tsx',
  'components/form/otp-field/index.stories.tsx',
  'components/form/password-field/index.stories.tsx',
  'components/form/prompt-input/index.stories.tsx',
  'components/form/questionnaire/index.stories.tsx',
  'components/form/radio-group/index.stories.tsx',
  'components/form/radio/index.stories.tsx',
  'components/form/rating/index.stories.tsx',
  'components/form/slider/index.stories.tsx',
  'components/form/switch/index.stories.tsx',
  'components/form/tel-field/index.stories.tsx',
  'components/form/text-area/index.stories.tsx',
  'components/form/text-field/index.stories.tsx',
  'components/form/time-field/index.stories.tsx',
  'components/layout/aspect-ratio/index.stories.tsx',
  'components/layout/divider/index.stories.tsx',
  'components/layout/message-scroller/index.stories.tsx',
  'components/layout/resizable/index.stories.tsx',
  'components/layout/scroll-area/index.stories.tsx',
  'components/layout/spacer/index.stories.tsx',
  'components/layout/splitter/index.stories.tsx',
  'components/navigation/breadcrumb/index.stories.tsx',
  'components/navigation/pagination/index.stories.tsx',
  'components/navigation/stepper/index.stories.tsx',
  'components/navigation/tabs/index.stories.tsx',
  'components/typography/highlight/index.stories.tsx',
  'components/typography/kbd/index.stories.tsx',
  'components/typography/label/index.stories.tsx',
  'components/typography/link/index.stories.tsx',
  'components/utility/ids-provider/index.stories.tsx',
  'components/utility/slot/index.stories.tsx',
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
