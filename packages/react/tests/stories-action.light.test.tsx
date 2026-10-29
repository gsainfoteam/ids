import { checkEveryStory, type StoryFiles } from './story-checks';

checkEveryStory(
  'light',
  import.meta.glob<StoryFiles[string]>('../src/components/action/**/*.stories.tsx', {
    eager: true,
  }),
);
