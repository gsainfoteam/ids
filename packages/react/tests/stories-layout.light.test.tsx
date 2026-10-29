import { checkEveryStory, type StoryFiles } from './story-checks';

checkEveryStory(
  'light',
  import.meta.glob<StoryFiles[string]>('../src/components/layout/**/*.stories.tsx', {
    eager: true,
  }),
);
