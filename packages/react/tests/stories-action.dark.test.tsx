import { checkEveryStory, type StoryFiles } from './story-checks';

checkEveryStory(
  'dark',
  import.meta.glob<StoryFiles[string]>('../src/components/action/**/*.stories.tsx', {
    eager: true,
  }),
);
